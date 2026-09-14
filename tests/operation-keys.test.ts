import { assignOperationNames, PUBLISHED_OPERATION_NAMES } from '../src/operation-keys.js';

/**
 * These exercise the naming rule directly, with a stub inference function, so a failure
 * points at the rule rather than at whatever the current spec happens to contain.
 */

const op = (operationId: string, path = '/x') => ({
  operationId,
  method: 'get',
  path,
  operation: {} as any
});

describe('assignOperationNames', () => {
  it('gives an uncontested operation the name that was inferred for it', () => {
    const names = assignOperationNames([op('Whatever')], () => 'list');
    expect(names.get('Whatever')).toBe('list');
  });

  it('keeps a published name even when the inferred one disagrees', () => {
    // The whole point: an upstream rewording changes what is inferred, and must not
    // change what the tool answers to.
    const names = assignOperationNames([op('GetDomain')], () => 'somethingElse');
    expect(names.get('GetDomain')).toBe('get');
  });

  it('does not let an unpublished operation take a published name', () => {
    const names = assignOperationNames([op('GetDomain'), op('GetPricingForDomain')], () => 'get');
    expect(names.get('GetDomain')).toBe('get');
    expect(names.get('GetPricingForDomain')).toBe('getPricingForDomain');
  });

  it('makes every operation reachable when several want the same name', () => {
    const names = assignOperationNames(
      [op('AlphaThing'), op('BetaThing'), op('GammaThing')],
      () => 'get'
    );
    expect([...names.values()].sort()).toEqual(['alphaThing', 'betaThing', 'gammaThing']);
  });

  it('does not depend on the order operations appear in the spec', () => {
    // A spec refresh that only reorders paths must not rename anything. Deciding per
    // contested group rather than first-come is what buys this.
    const forward = assignOperationNames([op('AlphaThing'), op('BetaThing')], () => 'get');
    const reverse = assignOperationNames([op('BetaThing'), op('AlphaThing')], () => 'get');
    expect([...forward.entries()].sort()).toEqual([...reverse.entries()].sort());
  });

  it('never gives two operations of a tag the same name', () => {
    const operations = [op('GetDomain'), op('Search'), op('Zed'), op('Zeta'), op('Zulu')];
    const names = assignOperationNames(operations, () => 'get');
    expect(new Set(names.values()).size).toBe(operations.length);
  });

  it('names every operation it was given', () => {
    const operations = [op('GetDomain'), op('Unlisted')];
    const names = assignOperationNames(operations, () => 'get');
    expect(names.size).toBe(operations.length);
  });
});

describe('PUBLISHED_OPERATION_NAMES', () => {
  it('is the record of what shipped, so entries are only ever added', () => {
    // Not an exhaustive list, just the ones whose value nobody would guess. If one of
    // these changes, a released client stops working.
    expect(PUBLISHED_OPERATION_NAMES.PurchasePrivacy).toBe('purchaseprivacy');
    expect(PUBLISHED_OPERATION_NAMES.SetContacts).toBe('setContacts');
    expect(PUBLISHED_OPERATION_NAMES.GetSubscribedNotifications).toBe('list');
    expect(PUBLISHED_OPERATION_NAMES.CheckAvailability).toBe('check');
  });
});
