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

/** Add one calendar month, clamping to the target month's last day
    (Jan 31 -> Feb 28/29, not Mar 3) instead of letting Date overflow into the month after. */
function advanceOneMonth(dateStr) {
  var d = parseRenewalDate(dateStr);
  var day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  var daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, daysInMonth));
  return d.toISOString().slice(0, 10);
}

/** Subscriptions renew, they don't disappear: an active sub whose renewal date has
    passed rolls forward a month at a time (handling however many cycles were missed)
    instead of being treated as stale data. Cancelled subs are left alone — their last
    renewal date is history, not a thing to keep advancing. Persists any date that
    changed back to Supabase so the roll-forward isn't just a display-time illusion. */
async function autoRenewPastDue(subs) {
  var updates = [];
  subs.forEach(function (s) {
    if (s.status !== 'active') return;
    var changed = false;
    while (daysUntilRenewal(s.renewalDate) < 0) {
      s.renewalDate = advanceOneMonth(s.renewalDate);
      changed = true;
    }
    if (changed) {
      updates.push(supabaseClient.from('subscriptions').update({ renewal_date: s.renewalDate }).eq('id', s.id));
    }
  });
  if (updates.length) await Promise.all(updates);
  return subs;
}

/** Map a Supabase `subscriptions` row to the app's in-memory subscription shape.
    id coerced to Number: PostgREST returns bigint ids as strings, but the app
    compares ids with `===` against parseInt() results elsewhere. */
function fromRow(row) {
  return {
    id:          Number(row.id),
    name:        row.name,
    category:    row.category,
    cost:        Number(row.cost),
    renewalDate: row.renewal_date,
    status:      row.status,
    notes:       row.notes || ''
  };
}

/** Map form data to a Supabase `subscriptions` row for insert/update. */
function toRow(formData) {
  return {
    name:         formData.name,
    category:     formData.category,
    cost:         parseFloat(formData.cost),
    renewal_date: formData.renewalDate,
    status:       formData.status,
    notes:        formData.notes || ''
  };
}

/** Fetch the current user's subscriptions from Supabase.
    Returns { subs, error } so callers can tell "no data" from "fetch failed" —
    those need different UI (empty state vs retry). */
async function fetchSubscriptions() {
  var user = await getCurrentUser();
  if (!user) return { subs: [], error: null };
  var res = await supabaseClient.from('subscriptions').select('*').eq('user_id', user.id);
  if (res.error) { console.error('fetchSubscriptions failed:', res.error); return { subs: [], error: res.error }; }
  var subs = await autoRenewPastDue(res.data.map(fromRow));
  return { subs: subs, error: null };
}
