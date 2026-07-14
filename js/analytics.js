/* ======================
   analytics.js
   Reads the same 'subscriptions' localStorage data as simple_CRUD.js
   and renders spend-by-category bars, status split, and a top-5 list.
   Loaded by: pages/analytics.html
   ====================== */

document.addEventListener('DOMContentLoaded', function () {
  var stored = localStorage.getItem('subscriptions');
  var subs = stored ? JSON.parse(stored) : [];
  var active = subs.filter(function (s) { return s.status === 'active'; });

  renderStats(subs, active);
  renderCategoryBreakdown(active);
  renderStatusSplit(subs, active);
  renderTopCosts(active);

  function renderStats(subs, active) {
    var total = active.reduce(function (sum, s) { return sum + s.cost; }, 0);
    var avg = active.length ? total / active.length : 0;
    setText('totalMonthly', 'RM ' + total.toFixed(2));
    setText('avgCost', 'RM ' + avg.toFixed(2));
    setText('activeCount', active.length);
    setText('cancelledCount', subs.length - active.length);
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

  function renderStatusSplit(subs, active) {
    var el = document.getElementById('statusSplit');
    if (!el) return;

    var cancelled = subs.length - active.length;
    var total = subs.length || 1;

    el.innerHTML =
      '<div class="bar-row">' +
        '<div class="bar-label">Active</div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + (active.length / total * 100).toFixed(1) + '%"></div></div>' +
        '<div class="bar-value">' + active.length + '</div>' +
      '</div>' +
      '<div class="bar-row">' +
        '<div class="bar-label">Cancelled</div>' +
        '<div class="bar-track"><div class="bar-fill bar-fill-muted" style="width:' + (cancelled / total * 100).toFixed(1) + '%"></div></div>' +
        '<div class="bar-value">' + cancelled + '</div>' +
      '</div>';
  }

  function renderTopCosts(active) {
    var el = document.getElementById('topCosts');
    if (!el) return;

    var top = active.slice().sort(function (a, b) { return b.cost - a.cost; }).slice(0, 5);
    if (top.length === 0) {
      el.innerHTML = '<div class="empty-state">No active subscriptions.</div>';
      return;
    }

    el.innerHTML = top.map(function (s) {
      return (
        '<div class="bar-row">' +
          '<div class="bar-label">' + s.name + '</div>' +
          '<div class="bar-track"></div>' +
          '<div class="bar-value">RM ' + s.cost.toFixed(2) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function setText(id, value) {
    var e = document.getElementById(id);
    if (e) e.textContent = value;
  }
});
