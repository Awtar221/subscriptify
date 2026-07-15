/* ======================
   auth-fx.js
   Login-page motion, three layers:
   1. Entrance choreography — anime.js timeline, split brand letters, staggered form.
   2. Generative canvas particle field on the brand panel (cursor-reactive), plus
      3D cursor tilt on the auth card.
   3. Cinematic exit — window.authFxExit(done): card fades, ink panel wipes across,
      then done() fires (login.js redirects inside it).

   Also exposes window.authFxShake() for failed-login feedback.

   Everything degrades cleanly: no anime.js -> static page, functional login;
   prefers-reduced-motion -> single static particle frame, no motion at all.

   Loaded by: pages/login.html (after anime.umd.min.js, before login.js)
   ====================== */

(function () {
  // Safe no-op fallbacks so login.js can call these unconditionally.
  window.authFxShake = function () {};
  window.authFxExit = function (done) { done(); };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasAnime = typeof anime !== 'undefined';

  /* ================= Particle field ================= */

  function initParticles(staticOnly) {
    var canvas = document.getElementById('authCanvas');
    if (!canvas) return;
    var panel = canvas.parentElement;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap DPR: fill-rate is the budget here
    var css = getComputedStyle(document.documentElement);
    var colors = ['--accent', '--brand-cream', '--brand-sage']
      .map(function (t) { return css.getPropertyValue(t).trim(); })
      .filter(Boolean);
    if (colors.length === 0) colors = ['#55868c'];

    // Pre-rendered glow sprites — one radial gradient each, drawn once.
    // Per-frame shadowBlur would tank fill rate; drawImage of a sprite is cheap.
    var SPRITE = 64;
    var sprites = colors.map(function (color) {
      var c = document.createElement('canvas');
      c.width = c.height = SPRITE;
      var g = c.getContext('2d');
      var grad = g.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE, SPRITE);
      return c;
    });

    var W = 0, H = 0, parts = [];
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      W = panel.clientWidth;
      H = panel.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      parts = [];
      var count = Math.round(Math.min(60, Math.max(30, (W * H) / 22000)));
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 14 + Math.random() * 42,           // sprite draw radius
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.06 - Math.random() * 0.22,     // slow upward drift
          a: 0.06 + Math.random() * 0.16,       // alpha
          s: (Math.random() * sprites.length) | 0,
          w: Math.random() * Math.PI * 2        // wobble phase
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        ctx.globalAlpha = p.a;
        ctx.drawImage(sprites[p.s], p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        if (staticOnly) continue;

        p.x += p.vx + Math.sin(t / 2400 + p.w) * 0.12;
        p.y += p.vy;

        // Gentle cursor repulsion
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 16000 && d2 > 1) {
          var f = 90 / d2;
          p.x += dx * f;
          p.y += dy * f;
        }

        // Wrap edges (with sprite margin so nothing pops)
        if (p.y < -p.r * 2) { p.y = H + p.r; p.x = Math.random() * W; }
        if (p.x < -p.r * 2) p.x = W + p.r;
        if (p.x > W + p.r * 2) p.x = -p.r;
      }
      ctx.globalAlpha = 1;
    }

    resize();
    seed();

    if (staticOnly) {
      draw(0);
      return;
    }

    panel.addEventListener('mousemove', function (e) {
      var r = panel.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    panel.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });
    window.addEventListener('resize', function () { resize(); });

    (function loop(t) {
      draw(t || 0);
      requestAnimationFrame(loop); // rAF self-pauses on hidden tabs
    })(0);
  }

  // Reduced motion still gets a composed static frame; full motion otherwise.
  initParticles(reduceMotion);

  if (!hasAnime || reduceMotion) return;

  var card = document.querySelector('.auth-card');

  /* ================= Feedback ================= */

  window.authFxShake = function () {
    if (!card) return;
    anime.animate(card, {
      keyframes: [
        { translateX: -9 }, { translateX: 8 }, { translateX: -5 }, { translateX: 3 }, { translateX: 0 }
      ],
      duration: 340,
      ease: 'outQuad'
    });
  };

  /* ================= Cinematic exit ================= */

  window.authFxExit = function (done) {
    var overlay = document.createElement('div');
    overlay.className = 'auth-exit-overlay';
    document.body.appendChild(overlay);

    var tl = anime.createTimeline({ onComplete: function () { done(); } });
    if (card) tl.add(card, { scale: [1, 0.94], opacity: [1, 0], duration: 300, ease: 'inQuad' }, 0);
    tl.add(overlay, { translateX: ['-101%', '0%'], duration: 480, ease: 'inOutQuint' }, 100);
  };

  /* ================= Entrance choreography ================= */

  var tl = anime.createTimeline({ defaults: { ease: 'outQuint' } });

  var brand = document.querySelector('.auth-visual-brand');
  if (brand) {
    var split = anime.splitText(brand, { chars: true });
    tl.add(split.chars, {
      opacity: [0, 1],
      translateY: ['0.55em', 0],
      duration: 550,
      delay: anime.stagger(38)
    }, 0);
  }

  tl.add('.auth-visual-tagline', { opacity: [0, 1], translateY: [14, 0], duration: 500 }, 260);
  tl.add('.auth-visual-point', {
    opacity: [0, 1],
    translateX: [-16, 0],
    duration: 450,
    delay: anime.stagger(90)
  }, 420);

  if (card) {
    tl.add(card, { opacity: [0, 1], translateY: [22, 0], duration: 550 }, 120);
    tl.add(card.querySelectorAll('.auth-title, .auth-sub, .form-group, .remember-me, .btn-auth, .auth-footer'), {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      delay: anime.stagger(55)
    }, 300);
  }

  /* ================= Card tilt ================= */

  var formPanel = document.querySelector('.auth-form-panel');
  if (card && formPanel) {
    // createAnimatable = smoothed, interruptible rotation that follows the cursor.
    var tilt = anime.createAnimatable(card, { rotateX: 380, rotateY: 380, ease: 'outQuad' });

    formPanel.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;   // roughly -0.5 .. 0.5
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tilt.rotateY(Math.max(-7, Math.min(7, dx * 10)));
      tilt.rotateX(Math.max(-7, Math.min(7, dy * -10)));
    });

    formPanel.addEventListener('mouseleave', function () {
      tilt.rotateX(0);
      tilt.rotateY(0);
    });
  }

  /* ================= Micro-interactions ================= */

  var toggle = document.getElementById('togglePassword');
  if (toggle) {
    toggle.addEventListener('click', function () {
      anime.animate(toggle, { rotateY: [0, 360], duration: 420, ease: 'outQuint' });
    });
  }

  var btn = document.querySelector('.btn-auth');
  if (btn) {
    btn.addEventListener('mouseenter', function () {
      anime.animate(btn, { scale: [1, 1.02], duration: 180, ease: 'outQuad' });
    });
    btn.addEventListener('mouseleave', function () {
      anime.animate(btn, { scale: 1, duration: 180, ease: 'outQuad' });
    });
  }
})();
