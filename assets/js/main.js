/* =========================================================================
   Jinyuan Ye — site behaviour
   Everything here is progressive enhancement: the page is fully readable with
   JavaScript disabled. Keep it dependency-free.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------------- 1. Theme: auto -> light -> dark -> auto ---------------- */
  var THEMES = ['auto', 'light', 'dark'];
  var LABELS = {
    auto: 'Theme: follow system (click to switch to light)',
    light: 'Theme: light (click to switch to dark)',
    dark: 'Theme: dark (click to follow system)'
  };

  function currentTheme() {
    var t = root.getAttribute('data-theme');
    return THEMES.indexOf(t) === -1 ? 'auto' : t;
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', LABELS[theme]);
      btn.setAttribute('title', LABELS[theme]);
    }
    try {
      if (theme === 'auto') localStorage.removeItem('theme');
      else localStorage.setItem('theme', theme);
    } catch (e) { /* private mode: ignore */ }
  }

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    applyTheme(currentTheme());
    toggle.addEventListener('click', function () {
      var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
      applyTheme(next);
    });
  }

  /* ---------------- 2. Active section in the navigation ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var navTargets = navLinks
    .map(function (a) {
      var id = a.getAttribute('href');
      if (!id || id.charAt(0) !== '#' || id.length < 2) return null;
      var el = document.getElementById(id.slice(1));
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && navTargets.length) {
    var setActive = function (link) {
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a === link); });
    };

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        for (var i = 0; i < navTargets.length; i++) {
          if (navTargets[i].el === entry.target) { setActive(navTargets[i].link); return; }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    navTargets.forEach(function (t) { spy.observe(t.el); });
  }

  /* ---------------- 3. Reveal on scroll ---------------- */
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealables = document.querySelectorAll(
      '.stat, .card, .pub, .cap, .entry, .timeline li, .talklist li, .awards li, .worklist li, .toolkit li'
    );

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i % 4, 3) * 55 + 'ms';
      revealer.observe(el);
    });
  }

  /* ---------------- 4. Copy the email address ---------------- */
  var copyBtn = document.querySelector('.copy-btn');
  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy') || '';
      navigator.clipboard.writeText(text).then(function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('is-done');
        window.setTimeout(function () {
          copyBtn.textContent = original;
          copyBtn.classList.remove('is-done');
        }, 1600);
      }).catch(function () { /* leave the address selectable by hand */ });
    });
  }

  /* ---------------- 5. Unfilled links ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('a[data-placeholder]'), function (a) {
    a.addEventListener('click', function (event) {
      event.preventDefault();
      toast('This link is not filled in yet.');
    });
  });

  function toast(message) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(function () {
      el.classList.remove('is-visible');
    }, 2200);
  }

  /* ---------------- 6. Footer year ---------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
