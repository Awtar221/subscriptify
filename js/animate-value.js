/* ======================
   animate-value.js
   Shared stat-card number transition: when a stat's text changes,
   count from the old value to the new one instead of snapping.
   Falls back to an instant set for non-numeric text or prefers-reduced-motion.

   Loaded by: index.html, pages/analytics.html (before simple_CRUD.js / analytics.js)
   ====================== */

function animateStatValue(el, newValue) {
  if (!el) return;

  var match = String(newValue).match(/^([^\d.]*)([\d.]+)(.*)$/);
  if (!match) { el.textContent = newValue; return; }

  var prefix = match[1], suffix = match[3];
  var target = parseFloat(match[2]);
  var decimals = (match[2].split('.')[1] || '').length;

  var startMatch = (el.textContent || '').match(/[\d.]+/);
  var start = startMatch ? parseFloat(startMatch[0]) : target;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || isNaN(start) || start === target) {
    el.textContent = newValue;
    return;
  }

  var duration = 450;
  var startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 4); // ease-out-quart
    var current = start + (target - start) * eased;
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = newValue;
  }

  requestAnimationFrame(step);
}
