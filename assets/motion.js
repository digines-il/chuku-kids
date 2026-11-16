/* chuku-kids scroll motion - vanilla port of the original's GSAP ScrollTrigger + Lenis effects.
   Mirrors the original component-for-component:
   SmoothScroll (Lenis lerp .12), HeroScrub, Parallax, ScrubIn, HorizontalScroll,
   SewnVsPrinted wipe, StitchShirt svg timeline, Counter. */
(function () {
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---- SmoothScroll: Lenis driven by the gsap ticker ---- */
  var lenis = new Lenis({ autoRaf: false, lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* original mounts at the top of each page, then refreshes triggers */
  lenis.scrollTo(0, { immediate: true });
  requestAnimationFrame(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  /* ---- HeroScrub (home hero) ---- */
  var heroImg = document.querySelector('[data-hero-img]');
  if (heroImg) {
    var hero = heroImg.closest('section') || heroImg.parentElement;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
    tl.to(hero.querySelectorAll('[data-hero-img]'), { scale: 1.45, rotate: -16, yPercent: 18 }, 0);
    tl.to(hero.querySelectorAll('.split-char'), {
      x: function (i) { return ((37 * i) % 9 - 4) * 34; },
      y: function (i) { return 60 + ((53 * i) % 7) * 28; },
      rotate: function (i) { return ((71 * i) % 11 - 5) * 9; },
      opacity: 0.15,
      stagger: { each: 0.02, from: 'center' }
    }, 0);
    tl.to(hero.querySelectorAll('[data-hero-fade]'), { yPercent: -40, opacity: 0 }, 0);
  }

  /* ---- Parallax: floating patches drifting at their data-speed ---- */
  document.querySelectorAll('[data-speed]').forEach(function (el) {
    var p = el.parentElement;
    var container = (p && p.classList.contains('pointer-events-none') && p.parentElement) ? p.parentElement : p;
    if (!container) return;
    var speed = parseFloat(el.getAttribute('data-speed')) || 1;
    gsap.fromTo(el, { y: 120 * speed }, {
      y: -120 * speed, rotate: 25 * speed, ease: 'none',
      scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---- ScrubIn: section content rising in ---- */
  var scrubIns = [];
  ['story-h', 'story'].forEach(function (id) {
    var h = document.getElementById(id);
    if (h && h.parentElement) scrubIns.push(h.parentElement);
  });
  document.querySelectorAll('.mt-12.grid.gap-6, .mt-10.flex.flex-wrap.justify-center.gap-4').forEach(function (el) {
    scrubIns.push(el);
  });
  scrubIns.forEach(function (c) {
    gsap.fromTo(c.children, { y: 70, opacity: 0, rotate: 2 }, {
      y: 0, opacity: 1, rotate: 0, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: c, start: 'top 92%', end: 'top 55%', scrub: true }
    });
  });

  /* ---- SewnVsPrinted: pinned embroidered/printed wipe ---- */
  document.querySelectorAll('[data-wipe]').forEach(function (w) {
    var inner = w.querySelector('[data-wipe-inner]');
    var outer = w.closest('.py-4') || w.parentElement;
    var tl2 = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: outer, start: 'center center', end: '+=110%', scrub: true, pin: true }
    });
    tl2.fromTo(w, { xPercent: 0 }, { xPercent: -100 }, 0);
    if (inner) tl2.fromTo(inner, { xPercent: 0 }, { xPercent: 100 }, 0);
  });

  /* ---- HorizontalScroll: pinned sideways product strip ---- */
  document.querySelectorAll('.hscroll').forEach(function (h) {
    var track = h.querySelector('[data-track]');
    if (!track) return;
    var amt = function () { return Math.max(0, track.scrollWidth - h.clientWidth); };
    gsap.to(track, {
      x: function () { return amt(); },
      ease: 'none',
      scrollTrigger: {
        trigger: h, start: 'center center',
        end: function () { return '+=' + amt(); },
        scrub: true, pin: true, invalidateOnRefresh: true
      }
    });
  });

  /* ---- Counter: numbers scrubbing up ---- */
  document.querySelectorAll('[data-n]').forEach(function (n) {
    var span = n.parentElement;
    var to = parseFloat(n.textContent.replace(/[^\d.]/g, '')) || 0;
    var obj = { v: 0 };
    gsap.to(obj, {
      v: to, ease: 'none',
      onUpdate: function () { n.textContent = Math.round(obj.v).toLocaleString('he-IL'); },
      scrollTrigger: { trigger: span, start: 'top 92%', end: 'top 50%', scrub: true }
    });
  });

  /* ---- StitchShirt: svg patch being sewn, drawn by scroll ---- */
  document.querySelectorAll('[data-shirt]').forEach(function (shirt) {
    var svg = shirt.closest('svg');
    var root = (svg && svg.parentElement) ? svg.parentElement : shirt.parentElement;
    var q = function (sel) { return root.querySelector(sel); };
    var tl3 = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top 75%', end: 'bottom 45%', scrub: true }
    });
    tl3.fromTo(shirt, { opacity: 0.25, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.2 }, 0)
      .fromTo(q('[data-thread]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3 }, 0.05)
      .fromTo(q('[data-patch]'), { scale: 0, rotate: -90, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.25 }, 0.25)
      .fromTo(q('[data-stitch]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45 }, 0.4)
      .fromTo(q('[data-needle]'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.4)
      .to(q('[data-needle]'), { rotate: 360, duration: 0.45 }, 0.4)
      .to(q('[data-needle]'), { opacity: 0, duration: 0.05 }, 0.86);
  });

  /* Refresh triggers in document order (the original mounts components in page
     order). Creation order here is per-component-type, so a pinned section
     created later but sitting higher on the page (e.g. services hscroll above
     the wipe) would never shift the starts below it. refreshPriority fixes
     every refresh, including the rAF/load ones scheduled above. */
  var ordered = ScrollTrigger.getAll().slice().sort(function (a, b) {
    var ta = a.trigger, tb = b.trigger;
    if (!ta || !tb || ta === tb) return 0;
    return (ta.compareDocumentPosition(tb) & 2) ? 1 : -1; /* 2 = PRECEDING */
  });
  ordered.forEach(function (st, i) { st.refreshPriority = ordered.length - i; });
  ScrollTrigger.refresh();
})();
