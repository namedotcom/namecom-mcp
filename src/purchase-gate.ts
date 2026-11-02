/**
 * Preview, then confirm: what a call that charges the account has to go through.
 *
 * The first call returns the price and a one-time token, and charges nothing. Only the same
 * call made again with that token reaches the API, and only if the price has not changed.
 * The remote name.com MCP server works the same way, so the same agent instructions fit both.
 */

import { createHash, randomBytes } from "crypto";
import { callNameApi } from "./api-client.js";
import {
  previewPurchase,
  previewRefund,
  priceKindFor,
  quoteStillHolds,
  renderPreview,
  type DomainStatus,
  type Pricing,
  type PurchasePreview,
  type Quote,
} from "./purchase-preview.js";

/** The argument that carries the token back. Never sent to the API. */
export const CONFIRMATION_ARG = 'confirmationToken';

/** How long a preview stays good for: long enough to read, short enough to go stale. */
export const TOKEN_TTL_MS = 5 * 60 * 1000;

/**
 * Calls that charge the account, plus the refund, which deletes the domains it refunds.
 * `PurchasePrivacy` is not here: WHOIS privacy is free through the API.
 */
const GATED: ReadonlySet<string> = new Set(['CreateDomain', 'RenewDomain', 'CreateTransfer', 'ProcessRefund']);

/** Operations on a domain the account already holds, whose current state is worth showing. */
const OWNED: ReadonlySet<string> = new Set(['RenewDomain']);

export function isGatedOperation(operationId: string): boolean {
  return GATED.has(operationId);
}

interface PendingConfirmation {
  operationId: string;
  fingerprint: string;
  quote: Quote;
  expiresAt: number;
}

/**
 * Outstanding previews, by token. This server runs as one local process for one user over
 * stdio, so memory is enough: a restart drops every preview, which only means asking again.
 */
const pending = new Map<string, PendingConfirmation>();

type ToolResult = { isError?: boolean; content: { type: "text"; text: string }[] };

function textResult(text: string): ToolResult {
  return { content: [{ type: "text", text }] };
}

function errorResult(text: string): ToolResult {
  return { isError: true, content: [{ type: "text", text }] };
}

/**
 * The call a preview was built for. Keys are sorted so argument order cannot change it; the
 * token and the operation selector are not part of what the caller asked for.
 */
export function fingerprint(operationId: string, args: Record<string, unknown>): string {
  const relevant = Object.entries(args)
    .filter(([key, value]) => key !== CONFIRMATION_ARG && key !== 'operation' && value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return createHash('sha256').update(operationId).update(' ').update(JSON.stringify(relevant)).digest('base64url');
}

/** `CreateDomain` carries the name in its body, the other operations in their path. */
function readDomainName(args: Record<string, unknown>): string | undefined {
  for (const key of ['domainName', 'domain_domainName']) {
    const raw = args[key];
    if (typeof raw === 'string' && raw !== '') return raw;
  }
  return undefined;
}

/** Years the caller asked for, defaulting to one the way the API does. */
function readYears(args: Record<string, unknown>): number {
  const raw = args['years'];
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) return raw;
  if (typeof raw === 'string') {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return 1;
}

function readOrderId(args: Record<string, unknown>): number | undefined {
  const raw = args['orderId'];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isInteger(parsed)) return parsed;
  }
  return undefined;
}

/** Order items a refund would reverse. The tool takes the list as a comma-separated string. */
function readItemIds(args: Record<string, unknown>): number[] {
  const raw = args['orderItemIds'];
  const parts = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : typeof raw === 'number' ? [raw] : [];
  return parts
    .map((p) => (typeof p === 'number' ? p : Number.parseInt(String(p).trim(), 10)))
    .filter((n) => Number.isInteger(n));
}

/** Look the price up. A failure here must never be read as "free". */
async function fetchPricing(domainName: string, years: number): Promise<Pricing | { error: string }> {
  try {
    const response = await callNameApi(`/core/v1/domains/${encodeURIComponent(domainName)}:getPricing?years=${years}`);
    return (response ?? {}) as Pricing;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { error: `Could not look up the price for ${domainName}, so nothing was charged: ${reason}` };
  }
}

/** Context only: a failed lookup leaves these lines out rather than blocking the purchase. */
async function fetchStatus(domainName: string): Promise<DomainStatus | undefined> {
  try {
    return ((await callNameApi(`/core/v1/domains/${encodeURIComponent(domainName)}`)) ?? undefined) as DomainStatus | undefined;
  } catch {
    return undefined;
  }
}

async function fetchBalance(): Promise<number | undefined> {
  try {
    const balance = ((await callNameApi('/core/v1/accountinfo/balance')) as { balance?: unknown } | undefined)?.balance;
    return typeof balance === 'number' ? balance : undefined;
  } catch {
    return undefined;
  }
}

async function buildPreview(operationId: string, args: Record<string, unknown>): Promise<PurchasePreview | { error: string }> {
  if (operationId === 'ProcessRefund') return previewRefund(readOrderId(args), readItemIds(args));

  const domainName = readDomainName(args);
  if (domainName === undefined) return { error: 'A domain name is required before a price can be quoted.' };

  const years = readYears(args);
  const pricing = await fetchPricing(domainName, years);
  if ('error' in pricing) return pricing;

  const status = OWNED.has(operationId) ? await fetchStatus(domainName) : undefined;
  return previewPurchase(operationId, domainName, years, pricing, status, await fetchBalance());
}

/** The approved amount against the live one. A refund has no amount to hold steady. */
async function priceHasHeld(operationId: string, args: Record<string, unknown>, quote: Quote): Promise<true | string> {
  if (quote.kind === 'none' || priceKindFor(operationId) === undefined) return true;

  const domainName = readDomainName(args);
  if (domainName === undefined) return 'A domain name is required. Nothing was charged.';

  const pricing = await fetchPricing(domainName, quote.years);
  if ('error' in pricing) return pricing.error;
  if (!quoteStillHolds(quote, pricing)) {
    return (
      `The price changed since it was quoted: $${quote.price.toFixed(2)} was approved and that ` +
      'is no longer the price. Nothing was charged. Ask again to see the current one.'
    );
  }
  return true;
}

/**
 * Decide whether a call may reach the API.
 *
 * Returns undefined when it may, which for a gated call means a valid token for this exact
 * call at an unchanged price. Otherwise returns what to answer instead: a preview, or why a
 * confirmation was refused.
 */
export async function gatePurchase(
  operationId: string,
  args: Record<string, unknown>,
  now: number = Date.now(),
): Promise<ToolResult | undefined> {
  if (!GATED.has(operationId)) return undefined;

  for (const [token, entry] of pending) {
    if (entry.expiresAt <= now) pending.delete(token);
  }

  const supplied = args[CONFIRMATION_ARG];
  if (supplied !== undefined && supplied !== null && supplied !== '') {
    const entry = typeof supplied === 'string' ? pending.get(supplied) : undefined;
    if (entry === undefined) {
      return errorResult(
        'This confirmation is not valid: it was already used, it expired, or it never existed. ' +
          'Nothing was charged. Call again without confirmationToken to see a new preview.',
      );
    }
    // Spent on first use, whatever happens next: applying twice is the damage this prevents.
    pending.delete(supplied as string);

    if (entry.operationId !== operationId || entry.fingerprint !== fingerprint(operationId, args)) {
      return errorResult(
        'The arguments changed since the preview. Nothing was charged. Preview the call again ' +
          'and confirm the result of that preview.',
      );
    }
    const held = await priceHasHeld(operationId, args, entry.quote);
    return held === true ? undefined : errorResult(held);
  }

  const preview = await buildPreview(operationId, args);
  if ('error' in preview) return errorResult(preview.error);

  const token = randomBytes(18).toString('base64url');
  pending.set(token, {
    operationId,
    fingerprint: fingerprint(operationId, args),
    quote: preview.quote,
    expiresAt: now + TOKEN_TTL_MS,
  });
  return textResult(renderPreview(preview, token));
}

/** Test seam: forget every outstanding preview. The server itself never calls this. */
export function resetPendingConfirmations(): void {
  pending.clear();
}
