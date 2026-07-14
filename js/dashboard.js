/* ======================
   dashboard.js
   Dashboard-only side panels: animated spend-by-category donut and the
   "Renewing Soon" list. Exposes renderDashboardExtras(subs), which
   simple_CRUD.js calls on every render so the panels stay in sync with CRUD.

   Loaded by: index.html (before simple_CRUD.js)
   ====================== */

(function () {
  var CIRCUMFERENCE = 2 * Math.PI * 48; // r=48 in a 120x120 viewBox
  var animatedOnce = false;             // dashboard entrance animation only on first paint

  function esc(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Segment colors pulled from the design-system tokens at runtime. */
  function tokenColors(tokens) {
    var css = getComputedStyle(document.documentElement);
    return (tokens || ['--accent', '--success', '--attention', '--danger', '--warning', '--mc-200'])
      .map(function (t) { return css.getPropertyValue(t).trim() || '#55868c'; });
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Render an animated donut chart + legend into a container.
   * Shared by the dashboard and analytics pages.
   * @param {HTMLElement} wrap
   * @param {{label:string, value:number, display:string}[]} entries  slices, largest-first
   * @param {{centerValue:string, centerSub:string, ariaLabel:string, tokens?:string[], animate?:boolean}} opts
   */
  window.renderDonutChart = function (wrap, entries, opts) {
    if (!wrap) return;

    entries = entries.filter(function (e) { return e.value > 0; });
    var total = entries.reduce(function (sum, e) { return sum + e.value; }, 0);

    if (entries.length === 0 || total <= 0) {
      wrap.innerHTML = '<div class="empty-state">No data yet.</div>';
      return;
    }

    var colors = tokenColors(opts.tokens);
    var startDeg = -90;
    var segments = entries.map(function (e, i) {
      var len = (e.value / total) * CIRCUMFERENCE;
      var seg =
        '<circle class="donut-seg" cx="60" cy="60" r="48" fill="none" ' +
          'stroke="' + colors[i % colors.length] + '" stroke-width="13" ' +
          'stroke-dasharray="' + len.toFixed(2) + ' ' + (CIRCUMFERENCE - len).toFixed(2) + '" ' +
          'transform="rotate(' + startDeg.toFixed(2) + ' 60 60)"></circle>';
      startDeg += (e.value / total) * 360;
      return seg;
    });

    wrap.innerHTML =
      '<div class="donut-figure">' +
        '<svg viewBox="0 0 120 120" role="img" aria-label="' + esc(opts.ariaLabel || 'Breakdown chart') + '">' +
          segments.join('') +
        '</svg>' +
        '<div class="donut-center">' +
          '<div class="donut-total">' + esc(opts.centerValue) + '</div>' +
          '<div class="donut-sub">' + esc(opts.centerSub) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="donut-legend">' +
        entries.map(function (e, i) {
          return (
            '<div class="donut-legend-row">' +
              '<span class="donut-legend-dot" style="background:' + colors[i % colors.length] + '"></span>' +
              '<span class="donut-legend-name">' + esc(e.label) + '</span>' +
              '<span class="donut-legend-value">' + esc(e.display) + '</span>' +
            '</div>'
          );
        }).join('') +
      '</div>';

    if (opts.animate && !reduceMotion() && typeof anime !== 'undefined') {
      anime.animate(wrap.querySelectorAll('.donut-seg'), {
        opacity: [0, 1],
        duration: 350,
        delay: anime.stagger(90),
        ease: 'outQuad'
      });
      anime.animate(wrap.querySelector('.donut-figure svg'), {
        rotate: [-24, 0],
        scale: [0.92, 1],
        duration: 550,
        ease: 'outQuint'
      });
      anime.animate(wrap.querySelectorAll('.donut-legend-row'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 300,
        delay: anime.stagger(60, { start: 200 }),
        ease: 'outQuad'
      });
    }
  };

  function renderDonut(active) {
    var wrap = document.getElementById('categoryDonut');
    if (!wrap) return;

    var totals = {};
    active.forEach(function (s) { totals[s.category] = (totals[s.category] || 0) + s.cost; });
    var categories = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; });
    var grandTotal = categories.reduce(function (sum, c) { return sum + totals[c]; }, 0);

    window.renderDonutChart(wrap, categories.map(function (cat) {
      return { label: cat, value: totals[cat], display: 'RM ' + totals[cat].toFixed(2) };
    }), {
      centerValue: 'RM ' + grandTotal.toFixed(2),
      centerSub: 'per month',
      ariaLabel: 'Monthly spend split by category',
      animate: !animatedOnce
    });
  }

  function renderUpcoming(active) {
    var el = document.getElementById('upcomingList');
    if (!el) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var upcoming = active
      .map(function (s) {
        var d = parseRenewalDate(s.renewalDate);
        if (isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        var days = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
        return days >= 0 ? { sub: s, days: days } : null;
      })
      .filter(Boolean)
      .sort(function (a, b) { return a.days - b.days; })
      .slice(0, 5);

    if (upcoming.length === 0) {
      el.innerHTML = '<div class="empty-state">Nothing renewing soon.</div>';
      return;
    }

    el.innerHTML = upcoming.map(function (u) {
      var when = u.days === 0 ? 'today' : u.days === 1 ? 'tomorrow' : 'in ' + u.days + ' days';
      var attention = u.days <= 7 ? ' donut-renewal-soon' : '';
      return (
        '<div class="donut-renewal-row">' +
          '<span class="donut-legend-name">' + esc(u.sub.name) + '</span>' +
          '<span class="donut-legend-value' + attention + '">' + when + '</span>' +
        '</div>'
      );
    }).join('');
  }

  /** Called by simple_CRUD.render(); no-op on pages without the dashboard panels. */
  window.renderDashboardExtras = function (subs) {
    var active = subs.filter(function (s) { return s.status === 'active'; });
    renderDonut(active);
    renderUpcoming(active);
    animatedOnce = true;
  };
})();
