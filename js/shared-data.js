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
  return { subs: res.data.map(fromRow), error: null };
}
