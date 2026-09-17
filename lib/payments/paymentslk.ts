import crypto from "node:crypto";

// PAYable / payments.lk provider module. Every payments.lk-specific detail
// (REST endpoints + webhook signature) lives here, so the rest of the app talks
// to one small surface and we are not locked to a third-party SDK. Implemented
// directly against payments.lk's documented API v1 using Node built-ins only
// (fetch + node:crypto), so there is no external runtime dependency to install.
// Verified against the official @payments-lk/node source (SHA-256 checked).
// Ref: https://payments.lk/developers/guide

const API_BASE = "https://api.payments.lk";
export const SIGNATURE_HEADER = "payments-signature";
const TOLERANCE_SECONDS = 300;

export function isPaymentsConfigured(): boolean {
  return !!process.env.PAYMENTS_LK_SECRET_KEY;
}

// SANDBOX ONLY. Our prices are USD, but the payments.lk API is LKR-only for now
// (their create-checkout has no currency field; Payment.currency is fixed to
// "LKR"). This placeholder rate lets us exercise the sandbox flow end to end.
// Revisit once PAYable confirm USD support. See memory: project-payment-gateway.
export const USD_TO_LKR_PLACEHOLDER = 320;

export function usdToLkrCents(usd: number): number {
  return Math.round(usd * USD_TO_LKR_PLACEHOLDER * 100);
}

export type CreateCheckoutInput = {
  amountCents: number; // LKR cents
  description: string;
  reference: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult = { id: string; url: string; status?: string };

/** Creates a hosted checkout. Send the customer to the returned url. */
export async function createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  const key = process.env.PAYMENTS_LK_SECRET_KEY;
  if (!key) throw new Error("PAYMENTS_LK_SECRET_KEY is not set");

  const res = await fetch(`${API_BASE}/v1/checkouts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      accept: "application/json",
      "content-type": "application/json",
      // Idempotency: our reference is unique per upgrade request, so a retry
      // never creates a duplicate checkout.
      "idempotency-key": input.reference,
    },
    body: JSON.stringify({
      amountCents: input.amountCents,
      description: input.description,
      reference: input.reference,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`payments.lk checkout failed (${res.status}): ${text.slice(0, 300)}`);
  }
  let data: { id?: string; url?: string; status?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("payments.lk returned a non-JSON checkout response");
  }
  if (!data?.url || !data?.id) throw new Error("payments.lk checkout response missing id/url");
  return { id: data.id, url: data.url, status: data.status };
}

export type WebhookEvent = {
  id: string;
  object: "event";
  type: string;
  mode?: string;
  created?: string;
  data: Record<string, unknown>;
};

/**
 * Verifies the payments-signature header and returns the parsed event, or
 * throws. Mirrors the documented scheme exactly: header
 * "t=<unix seconds>,v1=<hex HMAC-SHA256 of `${t}.${rawBody}`>", a 300s
 * tolerance, and a timing-safe comparison. Pass the RAW request body.
 */
export function constructEvent(rawBody: string, header: string | null, secret: string): WebhookEvent {
  if (!secret) throw new Error("Missing webhook signing secret");
  if (!header) throw new Error("Missing payments-signature header");
  if (header.length > 1000) throw new Error("payments-signature header too long");

  let timestamp: number | undefined;
  const candidates: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.trim().split("=", 2);
    if (k === "t" && v && /^[0-9]{1,12}$/.test(v)) timestamp = Number(v);
    if (k === "v1" && v && /^[0-9a-f]{64}$/.test(v)) candidates.push(v);
  }
  if (timestamp === undefined || candidates.length === 0) {
    throw new Error("payments-signature header is not in the expected t=...,v1=... form");
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) {
    throw new Error("Webhook timestamp outside tolerance (clock skew or replay)");
  }

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest();
  const matched = candidates.some((c) => {
    const buf = Buffer.from(c, "hex");
    return buf.length === expected.length && crypto.timingSafeEqual(expected, buf);
  });
  if (!matched) throw new Error("No signature matches this body and secret");

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw new Error("Webhook body is not JSON");
  }
  const rec = event as Record<string, unknown>;
  if (!rec || typeof rec !== "object" || rec.object !== "event" || typeof rec.id !== "string" || typeof rec.type !== "string") {
    throw new Error("Webhook body is not a payments.lk event");
  }
  return event as WebhookEvent;
}
