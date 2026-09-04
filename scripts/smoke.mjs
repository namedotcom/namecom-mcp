#!/usr/bin/env node
/**
 * Drive the built server against a real account, over the same stdio transport a client
 * uses.
 *
 * The unit tests prove the tool surface is what it claims to be. They cannot prove the
 * endpoints behind it answer, because every one of them is mocked. This closes that gap
 * for the operations a spec refresh actually moves.
 *
 *   npm run build
 *   NAME_USERNAME=... NAME_TOKEN=... node scripts/smoke.mjs
 *   NAME_USERNAME=... NAME_TOKEN=... node scripts/smoke.mjs --write
 *
 * Reads run against a domain the account already holds, discovered from the account
 * rather than hard-coded, so this works on any test account. `--write` adds a create,
 * read, update, delete cycle; without it nothing is modified. It points at the test
 * environment by default and refuses to run writes anywhere else.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const writes = process.argv.includes('--write');
const apiUrl = process.env.NAME_API_URL || 'https://mcp.dev.name.com';

if (writes && apiUrl !== 'https://mcp.dev.name.com') {
  console.error(`Refusing to run writes against ${apiUrl}. Writes are for the test environment.`);
  process.exit(2);
}
if (!process.env.NAME_USERNAME || !process.env.NAME_TOKEN) {
  console.error('Set NAME_USERNAME and NAME_TOKEN to an account on the test environment.');
  process.exit(2);
}

const server = spawn('node', [path.join(root, 'dist/index.js')], {
  cwd: root,
  env: { ...process.env, NAME_API_URL: apiUrl }
});
server.stderr.on('data', d => process.stderr.write(`server: ${d}`));

let buffer = '';
let nextId = 1;
const waiting = new Map();

server.stdout.on('data', chunk => {
  buffer += chunk.toString();
  let cut;
  while ((cut = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, cut).trim();
    buffer = buffer.slice(cut + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    const resolve = waiting.get(message.id);
    if (resolve) { waiting.delete(message.id); resolve(message); }
  }
});

function rpc(method, params) {
  const id = nextId++;
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  return new Promise((resolve, reject) => {
    waiting.set(id, resolve);
    setTimeout(() => reject(new Error(`${method} timed out`)), 30000);
  });
}

const results = [];

/**
 * A tool call, judged.
 *
 * Three outcomes, kept apart on purpose: the call worked, the API refused it, or the
 * arguments never reached the API because this script got the contract wrong. The third
 * is a bug in the test, not in the server, and reporting it as a failure of the server
 * would send someone hunting in the wrong repository.
 */
async function check(label, tool, args, { allow = [] } = {}) {
  let text = '';
  let outcome = 'PASS';
  try {
    const response = await rpc('tools/call', { name: tool, arguments: args });
    if (response.error) {
      outcome = 'FAIL';
      text = response.error.message;
    } else {
      text = response.result?.content?.[0]?.text ?? '';
      if (/^Error: Operation '.*' not supported/.test(text)) outcome = 'UNREACHABLE';
      else if (/^Error: (Missing required|Invalid) parameters/.test(text)) outcome = 'BAD-ARGS';
      else if (response.result?.isError) outcome = allow.some(p => text.includes(p)) ? 'SKIP' : 'FAIL';
    }
  } catch (error) {
    outcome = 'FAIL';
    text = error.message;
  }
  results.push({ label, outcome, detail: text.replace(/\s+/g, ' ').slice(0, 140) });
  const mark = { PASS: 'ok  ', SKIP: 'skip', FAIL: 'FAIL', 'BAD-ARGS': 'ARGS', UNREACHABLE: 'GONE' }[outcome];
  console.log(`  ${mark}  ${label}`);
  if (outcome !== 'PASS') console.log(`        ${results.at(-1).detail}`);
  return { outcome, text };
}

function firstDomain(text) {
  try {
    const parsed = JSON.parse(text);
    const list = parsed.domains ?? parsed.items ?? [];
    return list[0]?.domainName;
  } catch { return undefined; }
}

try {
  await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '0' }
  });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  const { result: listing } = await rpc('tools/list', {});
  console.log(`\n${apiUrl} — ${listing.tools.length} tools published\n`);

  console.log('account');
  await check('Hello answers, so the credentials work', 'Hello', {});
  await check('account balance reads', 'CheckAccountBalance', {});

  console.log('\nreads that need no domain');
  await check('TLD price list', 'TldPriceList', {});
  // Not every account is entitled to the premium list. Confirmed against the API with no
  // MCP code in the path: `hello` and the balance return 200 for the same credentials
  // while this returns 403, so a refusal here is a property of the account rather than
  // something this server did. Reported rather than counted as a failure.
  await check('premium domain lists', 'PremiumDomainLists', {}, { allow: ['403'] });
  await check('domain search', 'ManageDomains', { operation: 'search', keyword: 'example' });
  // Arrays of scalars are published as a comma-separated string, not a JSON array. That
  // is how this generator has always exposed them; passing a real array is rejected by
  // the tool schema before the call leaves the process.
  await check('availability check', 'ManageDomains', {
    operation: 'check', domainNames: 'this-name-is-not-registered-12345.com'
  });
  await check('batch availability (was unreachable before this release)', 'ManageDomains', {
    operation: 'zoneCheck', domainNames: 'example.com'
  });
  await check('TLD requirements', 'ManageDomainInfo', { operation: 'getRequirement', tld: 'com' });
  await check('TLD requirements v2 (new in this release)', 'ManageDomainInfo', {
    operation: 'getTldRequirementsV2', tld: 'com'
  });
  await check('trademark claims check (new in this release)', 'ManageDomainInfo', {
    operation: 'check', domain: 'example.com'
  });
  await check('transfer list', 'ManageTransfers', { operation: 'list' });

  const domains = await check('domain list', 'ManageDomains', { operation: 'list' });
  const domain = firstDomain(domains.text);

  if (!domain) {
    console.log('\nNo domain on this account, so the domain-scoped checks are skipped.');
  } else {
    console.log(`\nreads against ${domain}`);
    await check('domain detail', 'ManageDomains', { operation: 'get', domainName: domain });
    await check('pricing (was unreachable before this release)', 'ManageDomains', {
      operation: 'getPricingForDomain', domainName: domain, years: 1
    });
    await check('transfer auth code (was unreachable before this release)', 'ManageDomains', {
      operation: 'getAuthCodeForDomain', domainName: domain
    });
    await check('transfer eligibility (new in this release)', 'ManageTransfers', {
      operation: 'getTransferEligibility', domainName: domain
    });
    await check('DNS records', 'ManageDNS', { operation: 'list', domainName: domain });
    await check('URL forwardings (endpoint changed in this release)', 'ManageURLForwardings', {
      operation: 'list', domainName: domain
    });
  }

  if (writes && domain) {
    // The URL forwarding endpoints moved from being keyed by host to being keyed by id in
    // this release, so the round trip is the only thing that proves the new key is
    // threaded through create, read, update and delete consistently.
    const host = `mcp-smoke-${Date.now().toString(36)}`;
    console.log(`\nwrite cycle on ${host}.${domain}`);

    const created = await check('create a URL forwarding', 'ManageURLForwardings', {
      operation: 'create', domainName: domain, host, forwardsTo: 'https://www.name.com', type: 'redirect'
    });

    let id;
    try { id = JSON.parse(created.text).id; } catch { /* reported below */ }

    if (id === undefined) {
      console.log('        create returned no id, so the rest of the cycle cannot run');
      results.push({ label: 'URL forwarding cycle', outcome: 'FAIL', detail: 'no id in create response' });
    } else {
      await check('read it back by id', 'ManageURLForwardings', {
        operation: 'get', domainName: domain, id
      });
      // `type` is sent even though only the target is being changed: the spec declares no
      // required fields on this PATCH, but the API rejects a body without `type` with
      // "'type' can't be null". Verified directly against the API. The discrepancy is
      // upstream in the spec, so the tool cannot know to ask for it, and a partial update
      // will fail until the spec is corrected.
      await check('update it by id', 'ManageURLForwardings', {
        operation: 'update', domainName: domain, id,
        forwardsTo: 'https://www.name.com/about', type: 'redirect'
      });
      const deleted = await check('delete it by id', 'ManageURLForwardings', {
        operation: 'delete', domainName: domain, id
      });
      // The 204 fix: a delete used to render its success as a missing value.
      const readable = typeof deleted.text === 'string' && deleted.text.includes('204');
      results.push({
        label: 'the delete reads as success rather than an empty result',
        outcome: readable ? 'PASS' : 'FAIL',
        detail: deleted.text
      });
      console.log(`  ${readable ? 'ok  ' : 'FAIL'}  the delete reads as success rather than an empty result`);
      if (!readable) console.log(`        got: ${JSON.stringify(deleted.text)}`);
    }
  } else if (writes) {
    console.log('\nNo domain on this account, so the write cycle is skipped.');
  }
} finally {
  server.kill();
}

const tally = results.reduce((counts, r) => ({ ...counts, [r.outcome]: (counts[r.outcome] || 0) + 1 }), {});
console.log('\n' + Object.entries(tally).map(([k, v]) => `${k}=${v}`).join('  '));

const broken = results.filter(r => r.outcome !== 'PASS' && r.outcome !== 'SKIP');
if (broken.length > 0) {
  console.log('\nnot passing:');
  for (const r of broken) console.log(`  ${r.outcome}  ${r.label}\n      ${r.detail}`);
}
process.exit(broken.length === 0 ? 0 : 1);
