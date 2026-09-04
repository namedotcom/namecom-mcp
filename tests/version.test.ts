import fs from 'fs';
import path from 'path';
import { VERSION } from '../src/version.js';
import { SERVER_CONFIG } from '../src/config.js';

/**
 * Three places used to report three different versions: the manifest, the value the MCP
 * handshake advertises, and the one the User-Agent sends to the Core API. Traffic
 * attribution on the API side reads the third, so a disagreement is not cosmetic.
 *
 * `src/version.ts` is generated from the manifest by `prebuild`, and its committed copy is
 * whatever the last build left behind. That is what this really guards: run the build and
 * the three agree, skip it and they drift apart again.
 */
describe('the version this package reports', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  ) as { version: string };

  it('is the same one the User-Agent sends', () => {
    expect(VERSION).toBe(manifest.version);
  });

  it('is the same one the MCP handshake advertises', () => {
    expect(SERVER_CONFIG.version).toBe(manifest.version);
  });
});
