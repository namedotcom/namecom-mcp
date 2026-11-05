import type { MockedFunction } from 'vitest';
import { createToolsFromSpec } from '../src/tool-generator.js';
import { resetPendingConfirmations } from '../src/purchase-gate.js';

/**
 * The purchase flow through the tools built from the real spec, as a client calls them.
 * The API client is mocked; config is not, as in tool-surface.test.ts.
 */

vi.mock('../src/api-client.js', () => ({
  callNameApi: vi.fn()
}));

import { callNameApi } from '../src/api-client.js';

const mockCallNameApi = callNameApi as MockedFunction<typeof callNameApi>;

type Registered = { parameters: Record<string, any>; handler: (args: Record<string, any>) => Promise<any> };
const tools: Record<string, Registered> = {};

beforeAll(async () => {
  const server: any = {
    tool: (name: string, parameters: Record<string, any>, handler: Registered['handler']) => {
      tools[name] = { parameters, handler };
    }
  };
  expect(await createToolsFromSpec(server)).toBe(true);
});

beforeEach(() => {
  vi.clearAllMocks();
  resetPendingConfirmations();
  mockCallNameApi.mockImplementation(async (path: string) => {
    if (path.includes(':getPricing')) return { purchasePrice: 17.99, renewalPrice: 19.99 };
    if (path === '/core/v1/accountinfo/balance') return { balance: 100 };
    return { domain: { domainName: 'new.com' }, order: 1, totalPaid: 17.99 };
  });
});

const textOf = (result: any): string => result?.content?.[0]?.text ?? '';

describe('registering a domain', () => {
  it('needs no contact details: the account default contacts are used', async () => {
    // The contact fields used to be required, so a call without four full contacts was
    // refused, and the tool told agents to copy contacts from another domain instead.
    const preview = await tools.ManageDomains.handler({ operation: 'create', domain_domainName: 'new.com', years: 1 });
    expect(preview.isError).toBeUndefined();
    expect(textOf(preview)).toContain('Register new.com for 1 year.');
  });

  it('describes a contact field as required only once that contact is sent', () => {
    const email = tools.ManageDomains.parameters['domain_contacts_registrant_email'];
    expect(email.isOptional()).toBe(true);
    expect(email.description).toMatch(/^OPTIONAL for: create - .*\(required if you send any domain_contacts_registrant_\* parameter\)/);
  });

  it('no longer tells agents to copy contact details from other domains', () => {
    const operation = tools.ManageDomains.parameters['operation'].description as string;
    expect(operation).not.toContain('If contact info from other domains exists, use it');
    expect(operation).toContain("the account's default contacts are used");
  });

  it('charges only on the confirming call, which sends the token nowhere', async () => {
    const args = { operation: 'create', domain_domainName: 'new.com', years: 1 };
    const preview = await tools.ManageDomains.handler(args);
    const token = /confirmationToken: (\S+)/.exec(textOf(preview))?.[1];
    expect(mockCallNameApi).not.toHaveBeenCalledWith('/core/v1/domains', 'POST', expect.anything());

    await tools.ManageDomains.handler({ ...args, confirmationToken: token });
    expect(mockCallNameApi).toHaveBeenCalledWith('/core/v1/domains', 'POST', { domain: { domainName: 'new.com' }, years: 1 });
  });
});

describe('the confirmation token argument', () => {
  it('is offered by every tool with an operation that charges or refunds', () => {
    expect(tools.ManageDomains.parameters['confirmationToken']).toBeDefined();
    expect(tools.ManageTransfers.parameters['confirmationToken']).toBeDefined();
    expect(tools.ProcessRefund.parameters['confirmationToken']).toBeDefined();
  });

  it('is not offered where nothing is charged', () => {
    expect(tools.ManageDNS.parameters['confirmationToken']).toBeUndefined();
  });
});
