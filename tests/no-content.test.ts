import { createToolsFromSpec } from '../src/tool-generator.js';
import { callNameApi } from '../src/api-client.js';

/**
 * Every delete this package exposes returns HTTP 204, and every one of them used to
 * render its success as a missing value. The failure is invisible in a type-checked
 * build because the cast in `callNameApi` hides it, and invisible in a unit test that
 * only asserts the call was made, so it is asserted on the text itself.
 */

jest.mock('../src/api-client.js', () => ({
  callNameApi: jest.fn()
}));

const mockCallNameApi = callNameApi as jest.MockedFunction<typeof callNameApi>;

describe('operations that return no content', () => {
  let handlers: Record<string, Function>;

  beforeAll(async () => {
    handlers = {};
    const mockServer: any = {
      tool: (name: string, _parameters: unknown, handler: Function) => {
        handlers[name] = handler;
      }
    };
    await createToolsFromSpec(mockServer);
  });

  beforeEach(() => {
    mockCallNameApi.mockReset();
    // What the client hands back for a 204.
    mockCallNameApi.mockResolvedValue(undefined as any);
  });

  it('reports a delete as a readable success rather than a missing value', async () => {
    const result = await handlers.ManageDNS({
      operation: 'delete',
      domainName: 'example.com',
      id: 1
    });

    expect(result.isError).toBeFalsy();
    expect(typeof result.content[0].text).toBe('string');
    expect(result.content[0].text).toContain('DeleteRecord');
    expect(result.content[0].text).toContain('204');
  });

  it('still renders a real response body when there is one', async () => {
    mockCallNameApi.mockResolvedValue({ records: [] } as any);

    const result = await handlers.ManageDNS({
      operation: 'list',
      domainName: 'example.com'
    });

    expect(result.content[0].text).toBe(JSON.stringify({ records: [] }, null, 2));
  });
});
