/* ======================
   shared-data.js
   Shared subscription helpers used by simple_CRUD.js and analytics.js.
   Load this BEFORE either of those on any page reading 'subscriptions'.
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

/** Build demo subscriptions with renewal dates relative to today, so the "renewing soon" filter has an example. */
function getDemoSubscriptions() {
  function fromToday(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  return [
    { id: Date.now(),     name: 'Netflix',   category: 'Streaming',    cost: 45.00, renewalDate: fromToday(5),  status: 'active',    notes: '' },
    { id: Date.now() + 1, name: 'Spotify',   category: 'Streaming',    cost: 14.90, renewalDate: fromToday(18), status: 'active',    notes: '' },
    { id: Date.now() + 2, name: 'Adobe CC',  category: 'Design',       cost: 89.00, renewalDate: fromToday(25), status: 'active',    notes: '' },
    { id: Date.now() + 3, name: 'Notion',    category: 'Productivity', cost: 20.00, renewalDate: fromToday(12), status: 'active',    notes: '' },
    { id: Date.now() + 4, name: 'Disney+',   category: 'Streaming',    cost: 25.00, renewalDate: fromToday(-3), status: 'cancelled', notes: '' }
  ];
}

/** Ensure localStorage has subscriptions data; seed demo data if missing or empty. Returns the parsed list. */
function ensureSubscriptionsSeeded() {
  var stored = localStorage.getItem('subscriptions');
  var parsed = stored ? JSON.parse(stored) : [];
  if (parsed.length > 0) return parsed;
  var demo = getDemoSubscriptions();
  localStorage.setItem('subscriptions', JSON.stringify(demo));
  return demo;
}
