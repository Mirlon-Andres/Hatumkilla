/**
 * Hatum Killa - main.js
 * Lightweight, non-blocking. Covers:
 *  1. Smart nav (hide on scroll-down, show on scroll-up)
 *  2. Hamburger / drawer toggle
 *  3. IntersectionObserver scroll-reveal
 *  4. CSS Scroll-Snap carousel: auto-play + mouse-drag + dots
 *  5. Form basic submit feedback
 */

(function () {
  'use strict';

  /* ---- 1. Smart Sticky Nav ---- */
  const header     = document.querySelector('.site-header');
  let   lastY      = 0;
  let   ticking    = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY && y > 80) {
          header.classList.add('is-hidden');
          closeDrawer();           // hide drawer when nav hides
        } else {
          header.classList.remove('is-hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });


  /* ---- 2. Hamburger / Drawer ---- */
  const hamburger = document.querySelector('.nav-hamburger');
  const drawer    = document.querySelector('.nav-drawer');
  const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];

  function openDrawer() {
    hamburger.classList.add('is-open');
    drawer.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburger.classList.remove('is-open');
    drawer.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('is-open');
      isOpen ? closeDrawer() : openDrawer();
    });
  }

  // Close drawer when any link inside it is clicked
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });


  /* ---- 3. Scroll Reveal via IntersectionObserver ---- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(el => revealObs.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach(el => el.classList.add('is-visible'));
  }


  /* ---- 4. Carousel Auto-play + Mouse Drag + Dots ---- */
  const tracks = document.querySelectorAll('.carousel-track');

  tracks.forEach(track => {
    // Mouse drag-to-scroll
    let isDown = false, startX, scrollLeft;

    track.addEventListener('mousedown', e => {
      isDown     = true;
      startX     = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    });

    track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mouseup',    () => { isDown = false; track.style.cursor = 'grab'; });

    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Dots: update active on scroll
    const wrapper = track.closest('.carousel-wrapper');
    const dots    = wrapper ? wrapper.querySelectorAll('.cdot') : [];

    function updateDots() {
      if (!dots.length) return;
      const items     = track.querySelectorAll('.carousel-item');
      const itemWidth = items[0] ? items[0].offsetWidth + 20 : 0; // 20 = gap
      const idx       = Math.round(track.scrollLeft / Math.max(itemWidth, 1));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }

    if (dots.length > 0) {
      track.addEventListener('scroll', updateDots, { passive: true });
      updateDots();

      // Dot click navigation
      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          const items     = track.querySelectorAll('.carousel-item');
          const itemWidth = items[0] ? items[0].offsetWidth + 20 : 0;
          track.scrollTo({ left: i * itemWidth, behavior: 'smooth' });
        });
      });
    }

    // Auto-play every 3.5s
    let autoTimer = setInterval(() => {
      const items     = track.querySelectorAll('.carousel-item');
      if(items.length === 0) return;
      const itemWidth = items[0].offsetWidth + 20;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const next      = track.scrollLeft + itemWidth > maxScroll + 10
        ? 0
        : track.scrollLeft + itemWidth;
      track.scrollTo({ left: next, behavior: 'smooth' });
    }, 3500);

    // Pause auto-play on user interaction
    track.addEventListener('mousedown',  () => clearInterval(autoTimer));
    track.addEventListener('touchstart', () => clearInterval(autoTimer), { passive: true });
  });


  /* ---- 5. Contact Form Feedback ---- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = '✓ Mensaje enviado';
      btn.style.background = '#16a34a';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.textContent = 'Enviar Solicitud';
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    });
  }

})();
