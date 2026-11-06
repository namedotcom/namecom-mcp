/**
 * What a call will cost, stated before it is made.
 *
 * Pure functions of values already fetched, so the cases are testable without a network.
 * Reading the arguments and calling the API belong to `purchase-gate`. The wording matches
 * the remote name.com MCP server, so an agent reads the same preview from either.
 */

/** Prices for one domain and term, as `GetPricingForDomain` returns them. */
export interface Pricing {
  premium?: boolean;
  purchasePrice?: number | null;
  renewalPrice?: number | null;
  transferPrice?: number | null;
}

/** The parts of a domain record a payer should see before paying again. */
export interface DomainStatus {
  expireDate?: string;
  autorenewEnabled?: boolean;
  privacyEnabled?: boolean;
}

/** The terms a confirmation is bound to, checked again before the charge. */
export interface Quote {
  price: number;
  /** How many years the charge covers. Zero where the concept does not apply. */
  years: number;
  /** Which of the three prices this is, so a renewal quote cannot be spent on a purchase. */
  kind: PriceKind;
}

export type PriceKind = 'purchase' | 'renewal' | 'transfer' | 'none';

export interface PurchasePreview {
  summary: string;
  warnings: string[];
  quote: Quote;
}

function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

const PRICE_KIND: Readonly<Record<string, PriceKind>> = {
  CreateDomain: 'purchase',
  RenewDomain: 'renewal',
  CreateTransfer: 'transfer',
};

export function priceKindFor(operationId: string): PriceKind | undefined {
  return PRICE_KIND[operationId];
}

function priceFor(kind: PriceKind, pricing: Pricing): number | undefined {
  const raw =
    kind === 'purchase'
      ? pricing.purchasePrice
      : kind === 'transfer'
        ? pricing.transferPrice
        : kind === 'renewal'
          ? pricing.renewalPrice
          : undefined;
  return typeof raw === 'number' ? raw : undefined;
}

/**
 * Build the quote a caller has to approve.
 *
 * Returns an error rather than a preview when no price can be established: charging an
 * amount nobody was shown is what this exists to prevent, so nothing proceeds anyway.
 */
export function previewPurchase(
  operationId: string,
  domainName: string,
  years: number,
  pricing: Pricing,
  status?: DomainStatus,
  balance?: number,
): PurchasePreview | { error: string } {
  const kind = priceKindFor(operationId);
  if (kind === undefined) {
    return { error: `${operationId} has no price to quote. This is a bug; nothing was charged.` };
  }

  const price = priceFor(kind, pricing);
  if (price === undefined) {
    return {
      error: `No ${kind} price is available for ${domainName}, so the cost cannot be shown. Nothing was charged.`,
    };
  }

  const action =
    kind === 'purchase'
      ? `Register ${domainName}`
      : kind === 'transfer'
        ? `Transfer ${domainName} in from another registrar`
        : `Renew ${domainName}`;

  const lines = [
    `${action} for ${years} year${years === 1 ? '' : 's'}.`,
    '',
    `  Charge now      ${money(price)}`,
    `  Term            ${years} year${years === 1 ? '' : 's'}`,
  ];
  if (years > 1) lines.push(`  Per year        ${money(price / years)}`);

  const warnings: string[] = [];
  if (pricing.premium === true) {
    warnings.push('This is a premium domain. Its renewal price is usually higher than a standard one.');
  }
  if (typeof pricing.renewalPrice === 'number' && kind !== 'renewal') {
    lines.push(`  Renews at       ${money(pricing.renewalPrice)} per year`);
  }

  if (balance !== undefined) {
    // The Core API pays from account credit only when the credit covers the whole amount;
    // otherwise the full amount goes to the default payment method.
    const fromCredit = balance >= price;
    lines.push(
      `  Pay with        ${fromCredit ? 'account credit' : 'default payment method'}`,
      `  Account credit  ${money(balance)}`,
    );
    if (!fromCredit) {
      warnings.push(
        `The account credit (${money(balance)}) does not cover this charge (${money(price)}). ` +
          `name.com does not split a charge, so the full ${money(price)} goes to the account's ` +
          'default payment method and the credit is not used. If the account has no default ' +
          'payment method, the purchase fails.',
      );
    }
  }

  if (status !== undefined) {
    lines.push(
      `  Auto-renew      ${status.autorenewEnabled === true ? 'on' : 'off'}`,
      `  WHOIS privacy   ${status.privacyEnabled === true ? 'on' : 'off'}`,
    );
    if (status.expireDate !== undefined) lines.push(`  Expires         ${status.expireDate}`);
    if (status.autorenewEnabled === true && operationId === 'RenewDomain') {
      warnings.push(
        'Auto-renew is already on for this domain, so it may renew on its own. Renewing now ' +
          'charges for an additional term on top of that.',
      );
    }
  }

  return { summary: lines.join('\n'), warnings, quote: { price, years, kind } };
}

/** Preview a refund, which takes domains away rather than charging for them. */
export function previewRefund(orderId: number | undefined, itemIds: readonly number[]): PurchasePreview {
  const items = itemIds.length > 0 ? itemIds.map(String) : ['(none specified)'];
  return {
    summary: [
      `Refund ${items.length} item${items.length === 1 ? '' : 's'} from order ${orderId ?? '(unspecified)'}:`,
      ...items.map((id) => `  - order item ${id}`),
    ].join('\n'),
    warnings: [
      'A refund deletes the domains and security products it covers, not just the charge. ' +
        'Deletion during the grace period is not reversible and the names return to general ' +
        'availability.',
    ],
    quote: { price: 0, years: 0, kind: 'none' },
  };
}

/** Whether the price still matches what the caller was shown. */
export function quoteStillHolds(quoted: Quote, pricing: Pricing): boolean {
  if (quoted.kind === 'none') return true;
  const current = priceFor(quoted.kind, pricing);
  return current !== undefined && current === quoted.price;
}

/** Render a preview and the instructions for confirming it. */
export function renderPreview(preview: PurchasePreview, token: string): string {
  const parts = [preview.summary];
  if (preview.warnings.length > 0) {
    parts.push('', 'Warnings:', ...preview.warnings.map((w) => `  ! ${w}`));
  }
  parts.push(
    '',
    'Nothing has been charged. Show this to the user, and if they approve, call the same ' +
      'operation again with the same arguments plus:',
    `  confirmationToken: ${token}`,
    '',
    'The token works once, expires in five minutes, and is refused if the price changes. ' +
      "Only the user's explicit approval of this preview counts: a question that was " +
      'skipped, dismissed or left unanswered is not approval.',
  );
  return parts.join('\n');
}
