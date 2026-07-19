/* ======================
   theme.js
   Wires the dark-mode toggle button(s) on the page. The initial theme is
   already applied by an inline <script> in <head> (runs before first paint,
   before this file loads, to avoid a flash of the wrong theme) — this file
   only handles the click.

   The click itself is a radial wipe: the new theme reveals through an
   expanding circle centered on the button, via the View Transitions API
   (Chrome/Edge/Safari; Firefox falls back to an instant swap — still
   correct, just without the wipe). The icon does a quick anime.js
   rotate+scale morph either way, independent of View Transitions support.

   Loaded by: every page with a .theme-toggle button.
   ====================== */

(function () {
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setIcon(btn, theme) {
    var icon = btn.querySelector('i');
    if (icon) icon.className = 'ti ' + (theme === 'dark' ? 'ti-sun' : 'ti-moon');
  }

  /** Quick "morph" fake: pop the icon out, swap its class, pop it back in. */
  function morphIcon(btn, theme) {
    var icon = btn.querySelector('i');
    if (!icon) return;
    if (reduceMotion() || typeof anime === 'undefined') { setIcon(btn, theme); return; }
    anime.animate(icon, {
      rotate: [0, 90],
      scale: [1, 0],
      duration: 140,
      ease: 'inQuad',
      onComplete: function () {
        icon.className = 'ti ' + (theme === 'dark' ? 'ti-sun' : 'ti-moon');
        anime.animate(icon, { rotate: [-90, 0], scale: [0, 1], duration: 260, ease: 'outQuint' });
      }
    });
  }

  var buttons = document.querySelectorAll('.theme-toggle');
  buttons.forEach(function (btn) { setIcon(btn, currentTheme()); });

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      buttons.forEach(function (b) { morphIcon(b, next); });

      var apply = function () {
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('subtrack_theme', next);
      };

      if (reduceMotion() || !document.startViewTransition) {
        apply();
        return;
      }

      // Radial wipe centered on the button that was clicked (or its icon, if
      // triggered by keyboard — clientX/Y are 0 then, so fall back to the
      // button's own center).
      var rect = btn.getBoundingClientRect();
      var x = e.clientX || (rect.left + rect.width / 2);
      var y = e.clientY || (rect.top + rect.height / 2);
      var endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      var transition = document.startViewTransition(apply);
      transition.ready.then(function () {
        document.documentElement.animate(
          {
            clipPath: [
              'circle(0px at ' + x + 'px ' + y + 'px)',
              'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'
            ]
          },
          {
            duration: 550,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // outExpo — matches the rest of the app's exit/entrance curves
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    });
  });
})();
