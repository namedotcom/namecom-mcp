jest.mock('../src/api-client.js', () => ({
  callNameApi: jest.fn()
}));

import { callNameApi } from '../src/api-client.js';
import { gatePurchase, resetPendingConfirmations, TOKEN_TTL_MS } from '../src/purchase-gate.js';

const mockCallNameApi = callNameApi as jest.MockedFunction<typeof callNameApi>;

const REGISTER = { domain_domainName: 'new.com', years: 1 };
const RENEW = { domainName: 'held.com', years: 1 };

let pricing: Record<string, unknown>;

beforeEach(() => {
  jest.clearAllMocks();
  resetPendingConfirmations();
  pricing = { premium: false, purchasePrice: 17.99, renewalPrice: 19.99, transferPrice: 17.99 };
  mockCallNameApi.mockImplementation(async (path: string) => {
    if (path.includes(':getPricing')) return pricing;
    if (path === '/core/v1/accountinfo/balance') return { balance: 100 };
    if (path === '/core/v1/domains/held.com') return { autorenewEnabled: true, privacyEnabled: false, expireDate: '2027-01-01' };
    throw new Error(`unexpected call ${path}`);
  });
});

const textOf = (result: any): string => result?.content?.[0]?.text ?? '';
const tokenOf = (result: any): string | undefined => /confirmationToken: (\S+)/.exec(textOf(result))?.[1];

describe('a call that charges the account', () => {
  it('returns a preview with the price and a token, and charges nothing', async () => {
    const preview = await gatePurchase('CreateDomain', REGISTER);
    expect(textOf(preview)).toContain('Register new.com for 1 year.');
    expect(textOf(preview)).toContain('Charge now      $17.99');
    expect(tokenOf(preview)).toBeDefined();
    // Only lookups: the pricing and the balance.
    expect(mockCallNameApi.mock.calls.map(([path]) => path)).toEqual([
      '/core/v1/domains/new.com:getPricing?years=1',
      '/core/v1/accountinfo/balance',
    ]);
  });

  it('says that a skipped or unanswered question is not approval', async () => {
    const preview = await gatePurchase('CreateDomain', REGISTER);
    expect(textOf(preview)).toContain('a question that was skipped, dismissed or left unanswered is not approval');
  });

  it('lets the same call through with the token, at the quoted price', async () => {
    const token = tokenOf(await gatePurchase('CreateDomain', REGISTER));
    expect(await gatePurchase('CreateDomain', { ...REGISTER, confirmationToken: token })).toBeUndefined();
  });

  it('accepts a token only once', async () => {
    const token = tokenOf(await gatePurchase('CreateDomain', REGISTER));
    await gatePurchase('CreateDomain', { ...REGISTER, confirmationToken: token });
    const again = await gatePurchase('CreateDomain', { ...REGISTER, confirmationToken: token });
    expect(again?.isError).toBe(true);
    expect(textOf(again)).toContain('Nothing was charged');
  });

  it('refuses a token used for different arguments', async () => {
    const token = tokenOf(await gatePurchase('CreateDomain', REGISTER));
    const other = await gatePurchase('CreateDomain', { ...REGISTER, years: 2, confirmationToken: token });
    expect(other?.isError).toBe(true);
    expect(textOf(other)).toContain('arguments changed');
  });

  it('refuses a token minted for another operation', async () => {
    const token = tokenOf(await gatePurchase('RenewDomain', RENEW));
    const other = await gatePurchase('CreateTransfer', { ...RENEW, confirmationToken: token });
    expect(other?.isError).toBe(true);
  });

  it('refuses when the price changed since the preview', async () => {
    const token = tokenOf(await gatePurchase('CreateDomain', REGISTER));
    pricing = { ...pricing, purchasePrice: 29.99 };
    const changed = await gatePurchase('CreateDomain', { ...REGISTER, confirmationToken: token });
    expect(changed?.isError).toBe(true);
    expect(textOf(changed)).toContain('The price changed');
  });

  it('refuses a token after five minutes', async () => {
    const now = Date.now();
    const token = tokenOf(await gatePurchase('CreateDomain', REGISTER, now));
    const late = await gatePurchase('CreateDomain', { ...REGISTER, confirmationToken: token }, now + TOKEN_TTL_MS + 1);
    expect(late?.isError).toBe(true);
  });

  it('shows no preview, and charges nothing, when the price cannot be looked up', async () => {
    mockCallNameApi.mockRejectedValueOnce(new Error('name.com API error: 500'));
    const failed = await gatePurchase('CreateDomain', REGISTER);
    expect(failed?.isError).toBe(true);
    expect(tokenOf(failed)).toBeUndefined();
  });

  it('shows a renewal with the domain state and warns when auto-renew is already on', async () => {
    const preview = await gatePurchase('RenewDomain', RENEW);
    expect(textOf(preview)).toContain('Charge now      $19.99');
    expect(textOf(preview)).toContain('Auto-renew is already on');
  });
});

describe('a refund', () => {
  it('is previewed as a deletion, without a price lookup', async () => {
    const preview = await gatePurchase('ProcessRefund', { orderId: 42, orderItemIds: '7,8' });
    expect(textOf(preview)).toContain('Refund 2 items from order 42');
    expect(textOf(preview)).toContain('deletes the domains');
    expect(mockCallNameApi).not.toHaveBeenCalled();
  });
});

describe('a call that charges nothing', () => {
  it('passes straight through', async () => {
    expect(await gatePurchase('ListDomains', {})).toBeUndefined();
    expect(await gatePurchase('PurchasePrivacy', { domainName: 'held.com' })).toBeUndefined();
    expect(mockCallNameApi).not.toHaveBeenCalled();
  });
});
