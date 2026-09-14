/**
 * The names this package's consolidated tools answer to.
 *
 * A tag holding more than one operation is published as a single tool taking an
 * `operation` argument, and the value of that argument is public contract: a client that
 * learned `operation: "check"` has to keep reaching the same endpoint after an upgrade.
 *
 * Those names used to be derived at request time from each operation's summary and
 * description. That made the contract depend on prose written in another repository.
 * `TldPriceList` is the worked example: same operationId, same path, and the wording in
 * Core API 1.33.5 mentions "availability" where 1.7.0 did not, which is enough to move it
 * from `list` to `check` with no code change anywhere.
 *
 * So the names are written down. An operation listed here answers to the name beside it,
 * whatever its documentation says. An operation not listed here is new, and gets a name
 * derived from its operationId. Adding an entry is how you promise to keep serving a name;
 * changing one is a breaking change and belongs in a major release.
 *
 * Only operations in multi-operation tags appear here. A tag with one operation is
 * published as a tool of its own and takes no `operation` argument at all.
 */
export const PUBLISHED_OPERATION_NAMES = {
    // DNS
    ListRecords: 'list',
    CreateRecord: 'create',
    GetRecord: 'get',
    UpdateRecord: 'update',
    DeleteRecord: 'delete',
    // DNSSECs
    ListDNSSECs: 'list',
    CreateDNSSEC: 'create',
    GetDNSSEC: 'get',
    DeleteDNSSEC: 'delete',
    // Domains
    ListDomains: 'list',
    CreateDomain: 'create',
    GetDomain: 'get',
    UpdateDomain: 'update',
    // Lowercase, and not a typo: this name comes from the `:purchasePrivacy` suffix of the
    // path, lowercased on the way through. It has been published this way since 1.0.0.
    PurchasePrivacy: 'purchaseprivacy',
    RenewDomain: 'renew',
    SetContacts: 'setContacts',
    SetNameservers: 'setNameservers',
    CheckAvailability: 'check',
    Search: 'search',
    // Email Forwardings
    ListEmailForwardings: 'list',
    CreateEmailForwarding: 'create',
    GetEmailForwarding: 'get',
    UpdateEmailForwarding: 'update',
    DeleteEmailForwarding: 'delete',
    // Orders
    ListOrders: 'list',
    GetOrder: 'get',
    // Transfers
    ListTransfers: 'list',
    CreateTransfer: 'create',
    GetTransfer: 'get',
    CancelTransfer: 'cancel',
    // URL Forwardings
    //
    // The four operations keyed by `{host}` were deprecated upstream and replaced by
    // variants keyed by `{id}`. The successors inherit the retired names, so a caller keeps
    // writing `operation: "list"` and what changes is that it now passes an id instead of a
    // host. Moving a published name onto a different operation is only defensible because
    // the endpoint behind it was withdrawn, not because a different one looked tidier.
    CreateURLForwarding: 'create',
    ListURLForwardingsByDomain: 'list',
    GetURLForwardingById: 'get',
    UpdateURLForwardingById: 'update',
    DeleteURLForwardingById: 'delete',
    // Vanity Nameservers
    ListVanityNameservers: 'list',
    CreateVanityNameserver: 'create',
    GetVanityNameserver: 'get',
    UpdateVanityNameserver: 'update',
    DeleteVanityNameserver: 'delete',
    // Webhook Notifications
    GetSubscribedNotifications: 'list',
    SubscribeToNotification: 'create',
    ModifySubscription: 'modify',
    DeleteSubscription: 'delete',
};
/** `GetAuthCodeForDomain` becomes `getAuthCodeForDomain`. */
function derivedName(operationId) {
    return operationId.charAt(0).toLowerCase() + operationId.slice(1);
}
/**
 * Give every operation in a tag a name no other operation in that tag answers to.
 *
 * Dispatch is a lookup by this name, so two operations sharing one leaves the second
 * unreachable — present in the bundle, listed in the tool's own documentation, and
 * impossible to invoke.
 *
 * Published names are claimed first and never yield. Everything else takes its inferred
 * name only if exactly one operation wants it and no published name already holds it;
 * otherwise every operation that wanted it falls back to a name derived from its
 * operationId. Deciding per group rather than per operation is what keeps the result
 * independent of the order operations happen to appear in the spec, so a reordering
 * upstream cannot rename anything.
 */
export function assignOperationNames(operations, infer) {
    const names = new Map();
    const taken = new Set();
    for (const op of operations) {
        const published = PUBLISHED_OPERATION_NAMES[op.operationId];
        if (published === undefined)
            continue;
        names.set(op.operationId, published);
        taken.add(published);
    }
    const claims = new Map();
    for (const op of operations) {
        if (names.has(op.operationId))
            continue;
        const inferred = infer(op);
        const claimants = claims.get(inferred);
        if (claimants)
            claimants.push(op.operationId);
        else
            claims.set(inferred, [op.operationId]);
    }
    for (const [inferred, claimants] of claims) {
        const contested = claimants.length > 1 || taken.has(inferred);
        for (const operationId of claimants) {
            let name = contested ? derivedName(operationId) : inferred;
            // operationIds are unique within a spec, so this last resort always terminates and
            // always produces a name nothing else can hold.
            if (taken.has(name))
                name = operationId;
            names.set(operationId, name);
            taken.add(name);
        }
    }
    return names;
}
