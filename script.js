/**

 *
 * CDN LIBRARIES USED
 * ------------------
 * AOS 2.3.1          https://unpkg.com/aos@2.3.1/dist/aos.js
 * GSAP 3.12.5        https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
 * GSAP ScrollTrigger https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
 * Typed.js 2.1.0     https://cdn.jsdelivr.net/npm/typed.js@2.1.0/dist/typed.umd.js
 * Particles.js 2.0.0 https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js
 * Lenis 1.0.45       https://unpkg.com/lenis@1.0.45/dist/lenis.min.js
 * ══════════════════════════════════════════════════════════════
 */
'use strict';

/* ── UTILS ─────────────────────────────────────────────────── */
const Utils = {
  throttle(fn, ms) {
    let last = 0;
    return (...a) => { const n = Date.now(); if (n - last >= ms) { last = n; fn(...a); } };
  },
  debounce(fn, ms) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  },
};

/* ══════════════════════════════════════════════════════════════
   1. PAGE LOADER  [NEW]
   GSAP animates the loader bar, then fades out the overlay and
   reveals the rest of the page with a smooth entrance.
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   1. HERO ENTRANCE  [MODIFIED]
   Desktop: No animation (elements visible immediately).
   Mobile: Staggered animation.
══════════════════════════════════════════════════════════════ */
const HeroEntrance = (() => {
  return {
    play() {
      // Check for desktop (min-width: 769px)
      const isDesktop = window.matchMedia('(min-width: 769px)').matches;

      if (isDesktop) {
        // Desktop: Make visible immediately, no animation
        gsap.set('.gsap-hero', { opacity: 1, y: 0 });
        TypedInit.start();
      } else {
        // Mobile: Run the existing stagger animation
        const items = gsap.utils.toArray('.gsap-hero');
        gsap.fromTo(items,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            onComplete: () => {
              TypedInit.start();
            },
          }
        );
      }
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   3. TYPED.JS INIT  [NEW]
   Replaces the old manual typing engine.
   Target: #typed-output (renamed from #typingText in HTML)
══════════════════════════════════════════════════════════════ */
const TypedInit = (() => {
  let instance = null;

  return {
    start() {
      const el = document.getElementById('typed-output');
      if (!el || typeof Typed === 'undefined') return;

      instance = new Typed('#typed-output', {
        strings: [
          'Data Analyst',
          'Analytics Engineer',
          'PipeLine Builder',
          'Data Engineer'
        ],
        typeSpeed: 55,
        backSpeed: 30,
        backDelay: 1800,
        startDelay: 200,
        loop: true,
        smartBackspace: true,
        // Typed.js injects its own cursor; CSS styles it via .typed-cursor
      });
    },
    destroy() { instance?.destroy(); },
  };
})();

/* ══════════════════════════════════════════════════════════════
   4. PARTICLES.JS  [NEW]
   Lightweight particle network in the hero background.
   Automatically reduced on touch devices.
══════════════════════════════════════════════════════════════ */
const ParticlesInit = (() => {
  return {
    init() {
      if (typeof particlesJS === 'undefined') return;
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

      const isTouch = window.matchMedia('(pointer:coarse)').matches;
      const count = isTouch ? 25 : 55;

      particlesJS('particles-js', {
        particles: {
          number: { value: count, density: { enable: true, value_area: 900 } },
          color: { value: ['#6366f1', '#818cf8', '#f59e0b'] },
          shape: { type: 'circle' },
          opacity: { value: 0.45, random: true },
          size: { value: 2.5, random: true },
          line_linked: {
            enable: true, distance: 130,
            color: '#6366f1', opacity: 0.12, width: 1,
          },
          move: {
            enable: true, speed: 0.6,
            direction: 'none', random: true, out_mode: 'out',
          },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: !isTouch, mode: 'grab' },
            onclick: { enable: !isTouch, mode: 'push' },
          },
          modes: {
            grab: { distance: 160, line_linked: { opacity: 0.35 } },
            push: { particles_nb: 3 },
          },
        },
        retina_detect: true,
      });
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   5. CARD TILT  [NEW]
   GSAP 3D perspective tilt follows mouse position within each
   project card. Resets smoothly on mouse leave.
══════════════════════════════════════════════════════════════ */
const CardTilt = (() => {
  return {
    init() {
      if (typeof gsap === 'undefined') return;
      if (window.matchMedia('(pointer:coarse)').matches) return; // skip on touch

      document.querySelectorAll('.proj-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          const rx = ((y / r.height) - 0.5) * -12; // tilt X axis
          const ry = ((x / r.width) - 0.5) * 12; // tilt Y axis
          gsap.to(card, {
            rotateX: rx, rotateY: ry,
            transformPerspective: 800,
            duration: 0.2, ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0, rotateY: 0,
            duration: 0.3, ease: 'power3.out',
          });
        });
      });
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   6. GSAP SCROLL ANIMATIONS  [UPDATED]
   ScrollTrigger reveals for sections. 
   REMOVED: .tool-tile logic (caused errors).
══════════════════════════════════════════════════════════════ */
const GSAPScrollEffects = (() => {
  return {
    init() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);

      // Subtle parallax on the hero glow blob
      gsap.to('.hero-glow', {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
  };
})();



/* ══════════════════════════════════════════════════════════════
   8. MAGNETIC BUTTONS  [NEW]
   Buttons attract to cursor position within a threshold.
══════════════════════════════════════════════════════════════ */
const MagneticButtons = (() => {
  return {
    init() {
      if (window.matchMedia('(pointer:coarse)').matches) return;
      if (typeof gsap === 'undefined') return;

      const magnets = document.querySelectorAll('.btn, .nav-link, .socials a, .filter-btn, .back-top, .theme-toggle');

      magnets.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          // Move element towards mouse (strength factor 0.3)
          gsap.to(el, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.15,
            ease: 'power1.out'
          });
        });

        el.addEventListener('mouseleave', () => {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });
    }
  }
})();

/* ══════════════════════════════════════════════════════════════
   9. CUSTOM CURSOR  [KEPT — unchanged]
══════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════
   8. NAVBAR  [ENHANCED for DRAWER]
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   8. NAVBAR  [ENHANCED for DRAWER]
══════════════════════════════════════════════════════════════ */
const Navbar = (() => {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const drawer = document.getElementById('mobileMenuDrawer');
  const backdrop = document.getElementById('mobileMenuBackdrop');
  const drawerClose = document.getElementById('drawerClose');

  const links = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const sects = document.querySelectorAll('section[id]');

  // Scroll Spy Logic
  const scroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);

    // Active link highlighting
    const pos = window.scrollY + 120;
    sects.forEach(s => {
      if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) {
        const href = '#' + s.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === href));
        mobileLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === href));
      }
    });
  };

  // ── Helper: Lock Body Scroll (iOS-safe) ──
  const lockScroll = () => {
    const scrollY = window.scrollY;
    // Compensate for scrollbar disappearance to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.top = `-${scrollY}px`;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add('menu-open');
    document.body.dataset.scrollY = scrollY; // Store for restore

    // Hide theme toggle while menu is open
    document.getElementById('themeToggle')?.classList.add('menu-open');
  };

  // ── Helper: Unlock Body Scroll ──
  const unlockScroll = () => {
    const scrollY = document.body.dataset.scrollY || '0';

    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    document.body.style.paddingRight = '';
    delete document.body.dataset.scrollY;

    // Restore theme toggle
    document.getElementById('themeToggle')?.classList.remove('menu-open');

    window.scrollTo(0, parseInt(scrollY));
  };

  // ── Open Menu ──
  const openMenu = () => {
    if (!mobileMenu) return;

    lockScroll();
    mobileMenu.classList.add('active');
    toggle?.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');

    // Accessibility: Trap focus in drawer
    setTimeout(() => {
      if (drawer) {
        drawer.focus();
      }
    }, 50); // Small delay to allow visibility transition
  };

  // ── Close Menu ──
  const close = () => {
    if (!mobileMenu) return;

    mobileMenu.classList.remove('active');
    toggle?.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    unlockScroll();

    // Return focus to toggle button
    toggle?.focus();
  };

  // ── Link Click Handler (Smooth Scroll) ──
  const handleLinkClick = (e, link) => {
    // Only intercept hash links
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();

      // If mobile, close menu first
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        close();
      }

      const target = document.querySelector(href);
      if (target) {
        // Offset for fixed navbar + breathing room
        // If menu was open, we need to wait a tick for scroll unlock/restore before scrolling to target
        // But native behavior with our scroll unlock logic should be fine if we just scroll.
        // The unlockScroll restores position, then we scroll to target.
        // To be safe, we wrap in requestAnimationFrame or minimal timeout if needed, 
        // but typically window.scrollTo overrides the restore if called after.
        // Actually, we need to calculate offset relative to document.

        // Let's use a small timeout to ensure body is unlocked and reflowed
        setTimeout(() => {
          const elementPosition = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - 80, // 80px offset
            behavior: 'smooth'
          });
        }, 10);
      }
    }
  };

  return {
    init() {
      // 0. Scroll Spy
      window.addEventListener('scroll', Utils.throttle(scroll, 16));
      scroll(); // Initial check

      // 1. Hamburger Toggle
      if (toggle) {
        toggle.addEventListener('click', () => {
          const isOpen = mobileMenu?.classList.contains('active');
          isOpen ? close() : openMenu();
        });
      }

      // 2. Close Button (inside drawer)
      drawerClose?.addEventListener('click', close);

      // 3. Backdrop Click (outside drawer)
      backdrop?.addEventListener('click', close);

      // 4. Escape Key
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
          close();
        }
      });

      // 5. Desktop Links
      links.forEach(link => {
        link.addEventListener('click', e => handleLinkClick(e, link));
      });

      // 6. Mobile Links
      mobileLinks.forEach(link => {
        link.addEventListener('click', e => handleLinkClick(e, link));
      });
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   11. SKILLS BARS  [KEPT — same IntersectionObserver approach]
══════════════════════════════════════════════════════════════ */
const Skills = (() => {
  function build() {
    document.querySelectorAll('.skill-track').forEach(track => {
      const { label, val } = track.dataset;
      track.innerHTML = `
        <div class="sk-row">
          <span class="sk-name">${label}</span>
          <span class="sk-pct" data-target="${val}">0%</span>
        </div>
        <div class="sk-bar" role="progressbar" aria-valuenow="${val}" aria-valuemin="0" aria-valuemax="100">
          <div class="sk-fill" data-width="${val}"></div>
        </div>`;
    });
  }

  function animate(container) {
    const fill = container.querySelector('.sk-fill');
    const pct = container.querySelector('.sk-pct');
    if (!fill || !pct) return;
    const target = parseInt(fill.dataset.width, 10);
    requestAnimationFrame(() => { fill.style.width = target + '%'; });
    let cur = 0;
    const step = target / (1500 / 16);
    const run = () => {
      cur = Math.min(cur + step, target);
      pct.textContent = Math.floor(cur) + '%';
      if (cur < target) requestAnimationFrame(run);
    };
    run();
  }

  return {
    init() {
      build();
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.45, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.skill-track').forEach(t => obs.observe(t));
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   12. PROJECT FILTER  [KEPT — unchanged]
══════════════════════════════════════════════════════════════ */
const Filter = (() => {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.proj-card');

  function run(cat) {
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.filter === cat);
      b.setAttribute('aria-pressed', String(b.dataset.filter === cat));
    });
    cards.forEach((card, i) => {
      const cats = card.dataset.cat.split(' ');
      const show = cat === 'all' || cats.includes(cat);
      if (show) {
        card.style.display = '';
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        setTimeout(() => {
          card.style.transition = 'opacity .35s ease, transform .35s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 60);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });
  }

  return {
    init() {
      btns.forEach(btn => btn.addEventListener('click', () => run(btn.dataset.filter)));
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   13. CONTACT FORM  [KEPT — Formspree endpoint unchanged]
══════════════════════════════════════════════════════════════ */
const Form = (() => {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  const msgEl = document.getElementById('formMsg');
  const textarea = document.getElementById('fmsg');
  const cnt = document.querySelector('.char-cnt');

  const loading = on => {
    if (!btn) return;
    btn.disabled = on;
    btn.querySelector('.btn-text').style.display = on ? 'none' : '';
    btn.querySelector('.btn-loading').style.display = on ? '' : 'none';
  };

  const showMsg = (text, type) => {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'form-msg ' + type;
  };

  const showSuccess = () => {
    if (!form) return;
    form.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem">
        <div style="font-size:3rem;color:var(--ac-d);margin-bottom:1.5rem"><i class="fas fa-check-circle"></i></div>
        <h3 style="font-family:var(--ff-d);font-size:1.4rem;color:var(--t0);margin-bottom:1rem">Message sent!</h3>
        <p style="color:var(--t2);line-height:1.7">Thanks for reaching out. Hemant will reply within 24 hours.</p>
      </div>`;
  };

  return {
    init() {
      if (!form) return;
      textarea?.addEventListener('input', () => {
        if (cnt) cnt.textContent = textarea.value.length + ' / 1000';
      });
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const d = new FormData(form);
        const name = d.get('name')?.trim();
        const email = d.get('email')?.trim();
        const message = d.get('message')?.trim();
        if (!name || !email || !message) { showMsg('Please fill in all required fields.', 'error'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg('Please enter a valid email address.', 'error'); return; }
        loading(true);
        msgEl.className = 'form-msg'; msgEl.textContent = '';
        try {
          const res = await fetch('https://formspree.io/f/mnjbvqdr', {
            method: 'POST', body: d, headers: { Accept: 'application/json' },
          });
          res.ok ? showSuccess() : showMsg('Submission failed — please email directly.', 'error');
          if (!res.ok) loading(false);
        } catch {
          showMsg('Network error — please try again or email directly.', 'error');
          loading(false);
        }
      });
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   14. BACK TO TOP  [KEPT — unchanged]
══════════════════════════════════════════════════════════════ */
const BackTop = (() => {
  const btn = document.getElementById('backTop');
  return {
    init() {
      if (!btn) return;
      window.addEventListener('scroll', Utils.throttle(() => {
        btn.classList.toggle('visible', window.scrollY > 500);
      }, 100));
      btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   15. THEME TOGGLE  [NEW]
   Toggles .light-mode on <body>. Persists to localStorage.
   Sun icon in dark mode, moon icon in light mode.
══════════════════════════════════════════════════════════════ */
const ThemeToggle = (() => {
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');

  const setTheme = (light) => {
    document.body.classList.toggle('light-mode', light);
    if (icon) {
      icon.className = light ? 'fas fa-moon' : 'fas fa-sun';
    }
    if (btn) btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    localStorage.setItem('hs-theme', light ? 'light' : 'dark');
  };

  return {
    init() {
      if (!btn) return;
      // Restore saved preference
      const saved = localStorage.getItem('hs-theme');
      if (saved === 'light') setTheme(true);

      btn.addEventListener('click', () => {
        setTheme(!document.body.classList.contains('light-mode'));
      });
    },
  };
})();

/* ══════════════════════════════════════════════════════════════
   16. INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // AOS — scroll-reveal (all data-aos attributes in HTML)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 70,
      disable: () => window.matchMedia('(prefers-reduced-motion:reduce)').matches,
    });
  }

  // Boot order matters:
  // 1. Particles first (doesn't depend on anything)
  ParticlesInit.init();

  // 2. Cursor + Navbar (DOM-ready, no dependencies)
  ThemeToggle.init();
  Navbar.init();

  // 3. Hero Entrance - Conditional based on device
  HeroEntrance.play();

  // 4. GSAP scroll effects (requires ScrollTrigger)
  GSAPScrollEffects.init();

  // 5. Card tilt (desktop only)
  CardTilt.init();

  // 6. Skills + filter + form + back-top
  MagneticButtons.init();// [NEW]
  Skills.init();
  Filter.init();
  Form.init();
  BackTop.init();

  // Dynamic footer year
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  console.log('✅ Hemant Sonbarse portfolio v2 ready.');
});