import { getUncachableStripeClient } from "./stripeClient";

async function seed(): Promise<void> {
  const stripe = await getUncachableStripeClient();
  const existing = await stripe.products.search({ query: "name:'OUTSMART PRO' AND active:'true'" });
  const product = existing.data[0] ?? await stripe.products.create({
    name: "OUTSMART PRO",
    description: "Master the AI with memory, deep analysis, advanced predictions, unlimited play and every mode.",
    metadata: { product: "outsmart-pro" },
  });
  const prices = await stripe.prices.list({ product: product.id, active: true, type: "recurring" });
  if (!prices.data.some((price) => price.recurring?.interval === "month")) {
    await stripe.prices.create({ product: product.id, unit_amount: 499, currency: "gbp", recurring: { interval: "month" }, metadata: { plan: "monthly" } });
  }
  if (!prices.data.some((price) => price.recurring?.interval === "year")) {
    await stripe.prices.create({ product: product.id, unit_amount: 3999, currency: "gbp", recurring: { interval: "year" }, metadata: { plan: "annual", saving_percent: "33" } });
  }
  console.log(`OUTSMART PRO catalog ready (${product.id})`);
}

await seed();