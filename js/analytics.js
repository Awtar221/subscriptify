/* ======================
   analytics.js
   Reads the same 'subscriptions' localStorage data as simple_CRUD.js
   and renders spend-by-category bars, status split, and a top-5 list.
   Loaded by: pages/analytics.html
   ====================== */

document.addEventListener('DOMContentLoaded', function () {
  var subs = ensureSubscriptionsSeeded();
  var active = subs.filter(function (s) { return s.status === 'active'; });
  var renewingSoon = active.filter(isRenewingSoon);

  renderStats(subs, active);
  renderUpcomingRenewals(active);
  renderTopCosts(active);
  renderCategoryBreakdown(active);
  renderStatusSplit(subs, active, renewingSoon);

  /** Active sub renewing within 7 days — same window as the dashboard stat card. */
  function isRenewingSoon(s) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var d = parseRenewalDate(s.renewalDate);
    if (isNaN(d.getTime())) return false;
    d.setHours(0, 0, 0, 0);
    var diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }

  function renderStats(subs, active) {
    var total = active.reduce(function (sum, s) { return sum + s.cost; }, 0);
    var avg = active.length ? total / active.length : 0;
    var cancelled = subs.filter(function (s) { return s.status === 'cancelled'; });
    var savings = cancelled.reduce(function (sum, s) { return sum + s.cost; }, 0);

    setText('totalMonthly', 'RM ' + total.toFixed(2));
    setText('avgCost', 'RM ' + avg.toFixed(2));
    setText('activeCount', active.length);
    setText('cancelledCount', cancelled.length);
    setText('potentialSavings', 'RM ' + savings.toFixed(2));
  }

  function renderUpcomingRenewals(active) {
    var el = document.getElementById('upcomingRenewals');
    if (!el) return;

    var upcoming = active.slice().sort(function (a, b) {
      return parseRenewalDate(a.renewalDate) - parseRenewalDate(b.renewalDate);
    }).slice(0, 5);

    if (upcoming.length === 0) {
      el.innerHTML = '<div class="empty-state">Nothing renewing soon.</div>';
      return;
    }

    el.innerHTML = upcoming.map(function (s) {
      return (
        '<div class="rank-row">' +
          '<div class="rank-num"><i class="ti ti-calendar-event"></i></div>' +
          '<div class="rank-name">' + escapeHtml(s.name) + '</div>' +
          '<div class="rank-value">' + formatDate(s.renewalDate) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function formatDate(dateStr) {
    var d = parseRenewalDate(dateStr);
    return d.getDate() + ' ' + d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear();
  }

  function renderCategoryBreakdown(active) {
    var el = document.getElementById('categoryBreakdown');
    if (!el) return;

    var totals = {};
    active.forEach(function (s) { totals[s.category] = (totals[s.category] || 0) + s.cost; });
    var grandTotal = active.reduce(function (sum, s) { return sum + s.cost; }, 0);

    var categories = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; });
    if (categories.length === 0) {
      el.innerHTML = '<div class="empty-state">No active subscriptions.</div>';
      return;
    }

    el.innerHTML = categories.map(function (cat) {
      var pct = grandTotal ? (totals[cat] / grandTotal * 100) : 0;
      return (
        '<div class="bar-row">' +
          '<div class="bar-label">' + cat + '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct.toFixed(1) + '%"></div></div>' +
          '<div class="bar-value">RM ' + totals[cat].toFixed(2) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderStatusSplit(subs, active, renewingSoon) {
    var el = document.getElementById('statusSplit');
    if (!el) return;

    var cancelled = subs.length - active.length;
    var total = subs.length || 1;

    function row(label, count, fillClass) {
      return (
        '<div class="bar-row">' +
          '<div class="bar-label">' + label + '</div>' +
          '<div class="bar-track"><div class="bar-fill' + (fillClass ? ' ' + fillClass : '') + '" style="width:' + (count / total * 100).toFixed(1) + '%"></div></div>' +
          '<div class="bar-value">' + count + '</div>' +
        '</div>'
      );
    }

    el.innerHTML =
      row('Active', active.length) +
      row('Renewing Soon', renewingSoon.length, 'bar-fill-attention') +
      row('Cancelled', cancelled, 'bar-fill-muted');
  }

  function renderTopCosts(active) {
    var el = document.getElementById('topCosts');
    if (!el) return;

    var top = active.slice().sort(function (a, b) { return b.cost - a.cost; }).slice(0, 5);
    if (top.length === 0) {
      el.innerHTML = '<div class="empty-state">No active subscriptions.</div>';
      return;
    }

    el.innerHTML = top.map(function (s, i) {
      return (
        '<div class="rank-row">' +
          '<div class="rank-num">' + (i + 1) + '</div>' +
          '<div class="rank-name">' + escapeHtml(s.name) + '</div>' +
          '<div class="rank-value">RM ' + s.cost.toFixed(2) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function setText(id, value) {
    var e = document.getElementById(id);
    if (e) animateStatValue(e, value);
  }
});
