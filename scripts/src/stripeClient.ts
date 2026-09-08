import Stripe from "stripe";

export async function getUncachableStripeClient(): Promise<Stripe> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const token = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
      ? `depl ${process.env.WEB_REPL_RENEWAL}`
      : null;
  if (!hostname || !token) throw new Error("Stripe integration environment is unavailable");
  const response = await fetch(`https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`, {
    headers: { Accept: "application/json", X_REPLIT_TOKEN: token },
  });
  const data = await response.json() as { items?: Array<{ settings?: { secret?: string; secret_key?: string } }> };
  const settings = data.items?.[0]?.settings;
  const key = settings?.secret ?? settings?.secret_key;
  if (!key) throw new Error("Stripe connection has no secret key");
  return new Stripe(key);
}