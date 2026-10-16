// Plans & entitlements. Enforced on the server. Payments are not connected yet (no fake checkout).
export const PLANS = {
  free:     { name: 'Free',     maxEvents: 12,   maxVersions: 20,  aiPerDay: 20,  exports4k: true, collaboration: true },
  premium:  { name: 'Premium',  maxEvents: 50,  maxVersions: 200, aiPerDay: 200, exports4k: true, collaboration: true },
  business: { name: 'Business', maxEvents: 1000, maxVersions: 500, aiPerDay: 1000, exports4k: true, collaboration: true, clients: true, brandedExports: true },
};
export const entitlements = user => PLANS[user?.plan] || PLANS.free;
