import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, outsmartDevicesTable } from "@workspace/db";
import {
  CreateBillingCheckoutBody,
  CreateBillingPortalBody,
  CreateBillingPortalResponse,
  CreateBillingCheckoutResponse,
  GetBillingStatusBody,
  GetBillingStatusResponse,
} from "@workspace/api-zod";
import { getUncachableStripeClient } from "../stripeClient";

const router: IRouter = Router();
const TRIAL_DAYS = 7;
const PLAN_LOOKUP = { monthly: "monthly", annual: "annual" } as const;

async function getOrCreateDevice(deviceId: string, startTrial: boolean) {
  const [existing] = await db.select().from(outsmartDevicesTable).where(eq(outsmartDevicesTable.id, deviceId));
  if (existing) {
    if (startTrial && !existing.trialStartedAt) {
      const [updated] = await db.update(outsmartDevicesTable)
        .set({ trialStartedAt: new Date() })
        .where(eq(outsmartDevicesTable.id, deviceId))
        .returning();
      return updated;
    }
    return existing;
  }
  const [created] = await db.insert(outsmartDevicesTable).values({
    id: deviceId,
    trialStartedAt: startTrial ? new Date() : null,
  }).returning();
  return created;
}

async function getActiveSubscription(customerId: string | null) {
  if (!customerId) return null;
  const stripe = await getUncachableStripeClient();
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  return subscriptions.data.find((item) => ["active", "trialing", "past_due"].includes(item.status)) ?? null;
}

router.post("/billing/status", async (req, res): Promise<void> => {
  const parsed = GetBillingStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const device = await getOrCreateDevice(parsed.data.deviceId, parsed.data.onboardingComplete);
  const subscription = await getActiveSubscription(device.stripeCustomerId);
  const trialEndsAt = device.trialStartedAt
    ? new Date(device.trialStartedAt.getTime() + TRIAL_DAYS * 86_400_000)
    : null;
  const trialActive = Boolean(trialEndsAt && trialEndsAt.getTime() > Date.now());
  const isPro = Boolean(subscription) || trialActive;
  res.json(GetBillingStatusResponse.parse({
    access: subscription ? "pro" : trialActive ? "trial" : "free",
    isPro,
    trialDaysRemaining: trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000)) : 0,
    trialEndsAt: trialEndsAt?.toISOString() ?? null,
    monthlyPrice: "£4.99",
    annualPrice: "£39.99",
    annualSavingPercent: 33,
    canManage: Boolean(subscription),
  }));
});

router.post("/billing/checkout", async (req, res): Promise<void> => {
  const parsed = CreateBillingCheckoutBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const device = await getOrCreateDevice(parsed.data.deviceId, false);
  const stripe = await getUncachableStripeClient();
  let customerId = device.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ metadata: { outsmartDeviceId: device.id } });
    customerId = customer.id;
    await db.update(outsmartDevicesTable).set({ stripeCustomerId: customerId }).where(eq(outsmartDevicesTable.id, device.id));
  }
  const products = await stripe.products.search({ query: "name:'OUTSMART PRO' AND active:'true'" });
  const product = products.data[0];
  if (!product) { res.status(503).json({ error: "OUTSMART PRO pricing is not configured" }); return; }
  const prices = await stripe.prices.list({ product: product.id, active: true, type: "recurring" });
  const interval = PLAN_LOOKUP[parsed.data.plan] === "monthly" ? "month" : "year";
  const price = prices.data.find((item) => item.recurring?.interval === interval);
  if (!price) { res.status(503).json({ error: "Selected plan is not configured" }); return; }
  const origin = `${req.protocol}://${req.get("host")}`;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${origin}/pro?checkout=success`,
    cancel_url: `${origin}/pro?checkout=cancelled`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { outsmartDeviceId: device.id } },
  });
  res.json(CreateBillingCheckoutResponse.parse({ url: session.url }));
});

router.post("/billing/portal", async (req, res): Promise<void> => {
  const parsed = CreateBillingPortalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [device] = await db.select().from(outsmartDevicesTable).where(eq(outsmartDevicesTable.id, parsed.data.deviceId));
  if (!device?.stripeCustomerId) { res.status(404).json({ error: "No billing account found" }); return; }
  const stripe = await getUncachableStripeClient();
  const origin = `${req.protocol}://${req.get("host")}`;
  const portal = await stripe.billingPortal.sessions.create({ customer: device.stripeCustomerId, return_url: `${origin}/pro` });
  res.json(CreateBillingPortalResponse.parse({ url: portal.url }));
});

export default router;