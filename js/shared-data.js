/* ======================
   shared-data.js
   Shared subscription helpers used by simple_CRUD.js, analytics.js, and dashboard.js.
   Load this BEFORE any of those on any page reading 'subscriptions'.
   ====================== */

/** Parse 'YYYY-MM-DD' or 'DD-MM-YYYY'/'DD/MM/YYYY' into a Date. */
function parseRenewalDate(dateStr) {
  var parts = dateStr.split(/[/-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]);
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}

/** Whole days from today to a subscription's renewal date (negative = past). NaN if unparseable. */
function daysUntilRenewal(dateStr) {
  var d = parseRenewalDate(dateStr);
  if (isNaN(d.getTime())) return NaN;
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

/** Active sub renewing within 7 days — the "renewing soon" window used across dashboard/analytics. */
function isRenewingSoon(sub) {
  if (sub.status !== 'active') return false;
  var days = daysUntilRenewal(sub.renewalDate);
  return !isNaN(days) && days >= 0 && days <= 7;
}

/** Build demo subscriptions with renewal dates relative to today, so the "renewing soon" filter has an example. */
function getDemoSubscriptions() {
  function fromToday(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  return [
    { id: Date.now(),      name: 'Netflix',          category: 'Streaming',    cost: 45.00,  renewalDate: fromToday(5),  status: 'active',    notes: '' },
    { id: Date.now() + 1,  name: 'Spotify',          category: 'Music',        cost: 14.90,  renewalDate: fromToday(18), status: 'active',    notes: '' },
    { id: Date.now() + 2,  name: 'Adobe CC',         category: 'Design',       cost: 89.00,  renewalDate: fromToday(25), status: 'active',    notes: '' },
    { id: Date.now() + 3,  name: 'Notion',           category: 'Productivity', cost: 20.00,  renewalDate: fromToday(12), status: 'active',    notes: '' },
    { id: Date.now() + 4,  name: 'Disney+',          category: 'Streaming',    cost: 25.00,  renewalDate: fromToday(-3), status: 'cancelled', notes: '' },
    { id: Date.now() + 5,  name: 'YouTube Premium',  category: 'Streaming',    cost: 17.90,  renewalDate: fromToday(3),  status: 'active',    notes: '' },
    { id: Date.now() + 6,  name: 'iCloud 200GB',     category: 'Storage',      cost: 11.90,  renewalDate: fromToday(9),  status: 'active',    notes: '' },
    { id: Date.now() + 7,  name: 'Google One',       category: 'Storage',      cost: 8.49,   renewalDate: fromToday(21), status: 'active',    notes: '' },
    { id: Date.now() + 8,  name: 'Figma',            category: 'Design',       cost: 57.00,  renewalDate: fromToday(14), status: 'active',    notes: '' },
    { id: Date.now() + 9,  name: 'Canva Pro',        category: 'Design',       cost: 32.90,  renewalDate: fromToday(-8), status: 'cancelled', notes: '' },
    { id: Date.now() + 10, name: 'Apple Music',      category: 'Music',        cost: 16.90,  renewalDate: fromToday(6),  status: 'active',    notes: '' },
    { id: Date.now() + 11, name: 'HBO Max',          category: 'Streaming',    cost: 34.90,  renewalDate: fromToday(28), status: 'active',    notes: '' },
    { id: Date.now() + 12, name: 'Dropbox Plus',     category: 'Storage',      cost: 47.88,  renewalDate: fromToday(19), status: 'active',    notes: '' },
    { id: Date.now() + 13, name: 'ChatGPT Plus',     category: 'Productivity', cost: 94.00,  renewalDate: fromToday(2),  status: 'active',    notes: '' },
    { id: Date.now() + 14, name: 'Microsoft 365',    category: 'Productivity', cost: 29.90,  renewalDate: fromToday(45), status: 'active',    notes: '' },
    { id: Date.now() + 15, name: 'Grammarly',        category: 'Productivity', cost: 50.00,  renewalDate: fromToday(-15), status: 'cancelled', notes: '' },
    { id: Date.now() + 16, name: 'Crunchyroll',      category: 'Streaming',    cost: 22.90,  renewalDate: fromToday(11), status: 'active',    notes: '' },
    { id: Date.now() + 17, name: 'Nintendo Online',  category: 'Other',        cost: 14.90,  renewalDate: fromToday(60), status: 'active',    notes: '' },
    { id: Date.now() + 18, name: 'PlayStation Plus', category: 'Other',        cost: 35.90,  renewalDate: fromToday(-20), status: 'cancelled', notes: '' },
    { id: Date.now() + 19, name: 'Audible',          category: 'Other',        cost: 42.90,  renewalDate: fromToday(33), status: 'active',    notes: '' }
  ];
}

/** Coerce one stored record into a safe shape; returns null if unusable.
    Guards against hand-edited or imported JSON (string costs, missing fields)
    that would otherwise crash `.toFixed()` / `.toLowerCase()` in every consumer. */
function normalizeSubscription(raw) {
  if (!raw || typeof raw !== 'object') return null;
  var cost = parseFloat(raw.cost);
  var name = String(raw.name || '').trim();
  if (!name || isNaN(cost) || cost < 0) return null;
  return {
    id:          typeof raw.id === 'number' ? raw.id : Date.now() + Math.floor(Math.random() * 1000),
    name:        name.slice(0, 60),
    category:    String(raw.category || 'Other'),
    cost:        cost,
    renewalDate: String(raw.renewalDate || ''),
    status:      raw.status === 'cancelled' ? 'cancelled' : 'active',
    notes:       String(raw.notes || '').slice(0, 200)
  };
}

/** Ensure localStorage has subscriptions data; seed demo data if missing or empty. Returns the parsed list. */
function ensureSubscriptionsSeeded() {
  var parsed = [];
  try {
    var stored = localStorage.getItem('subscriptions');
    parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) parsed = [];
  } catch (e) {
    parsed = []; // corrupt JSON — fall through to demo seed
  }
  parsed = parsed.map(normalizeSubscription).filter(Boolean);
  if (parsed.length > 0) return parsed;
  var demo = getDemoSubscriptions();
  localStorage.setItem('subscriptions', JSON.stringify(demo));
  return demo;
}
