import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';
import { createToolsFromSpec } from '../src/tool-generator.js';

/**
 * The tool surface is this package's public contract. A client that learned to call
 * `ManageDomains` with `operation: "check"` keeps calling it that way across upgrades, so
 * a tool that changes name, or an operation that quietly stops answering, breaks callers
 * without breaking a single test elsewhere in this repo.
 *
 * `tests/tool-surface.json` is the expected surface, committed. It is compared, never
 * regenerated: a diff in that file is the reviewable record of a contract change, and a
 * failure here means either the change was unintended or the file was not updated on
 * purpose.
 *
 * The API client is mocked because no request is made. `src/config.js` deliberately is
 * not: the operation and tag exclusion lists live there, and a surface measured with
 * those mocked away would not be the surface users get.
 */

jest.mock('../src/api-client.js', () => ({
  callNameApi: jest.fn()
}));

interface ExpectedSurface {
  spec: string;
  tools: Record<string, string[] | null>;
}

describe('published tool surface', () => {
  const expected: ExpectedSurface = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'tool-surface.json'), 'utf8')
  );

  let actual: Record<string, string[] | null>;

  beforeAll(async () => {
    const registered: Record<string, string[] | null> = {};

    const mockServer: any = {
      tool: (name: string, parameters: Record<string, any>) => {
        const operation = parameters?.operation;
        const options = operation === undefined ? undefined : (operation as any).options;
        registered[name] = Array.isArray(options) ? [...options].sort() : null;
      }
    };

    const created = await createToolsFromSpec(mockServer);
    expect(created).toBe(true);

    actual = Object.fromEntries(Object.keys(registered).sort().map(k => [k, registered[k]]));
  });

  it('publishes exactly the tools recorded in tool-surface.json', () => {
    expect(Object.keys(actual)).toEqual(Object.keys(expected.tools));
  });

  it('publishes exactly the operations recorded for each tool', () => {
    expect(actual).toEqual(expected.tools);
  });

  it('was measured against the spec version the expectation was written for', () => {
    // Guards against the surface and the expectation drifting apart because the spec was
    // refreshed without anyone revisiting this file.
    const spec = load(
      fs.readFileSync(path.join(__dirname, '../assets/namecom.api.yaml'), 'utf8')
    ) as { info: { version: string } };
    expect(spec.info.version).toBe(expected.spec);
  });

  it('gives every operation of a tool a distinct name', () => {
    // Dispatch is a lookup by this name. Two operations sharing one leaves the second
    // permanently unreachable: no error, no warning, and it still appears in the tool's
    // documentation. That is how three operations went missing before this test existed.
    for (const [tool, operations] of Object.entries(actual)) {
      if (operations === null) continue;
      expect({ tool, unique: new Set(operations).size }).toEqual({
        tool,
        unique: operations.length
      });
    }
  });
});
