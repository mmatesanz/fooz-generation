/* main.js — FooZ Generation prototype interactions */

(function () {
  'use strict';

  /* =============================================
     NAV SCROLL BEHAVIOR
     ============================================= */
  const nav = document.getElementById('nav');

  /* =============================================
     HAMBURGER MENU
     ============================================= */
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        burger.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  function updateNav() {
    if (window.scrollY > 48) {
      nav.classList.remove('nav--transparent');
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.add('nav--transparent');
      nav.classList.remove('nav--scrolled');
    }
  }

  if (nav) {
    nav.classList.add('nav--transparent');
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* =============================================
     SECTION FADE-IN ON SCROLL
     ============================================= */
  const fadeTargets = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeTargets.length > 0) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* Fallback: make all visible immediately */
    fadeTargets.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* =============================================
     GAMA HOVER — color accent propagation
     (CSS handles the visual; JS adds aria-expanded
     for keyboard accessibility and screen readers)
     ============================================= */
  const gamas = document.querySelectorAll('.gama');

  gamas.forEach(function (gama) {
    gama.addEventListener('mouseenter', function () {
      gama.setAttribute('aria-expanded', 'true');
    });
    gama.addEventListener('mouseleave', function () {
      gama.setAttribute('aria-expanded', 'false');
    });
    gama.addEventListener('focusin', function () {
      gama.setAttribute('aria-expanded', 'true');
    });
    gama.addEventListener('focusout', function () {
      gama.setAttribute('aria-expanded', 'false');
    });
  });

  /* =============================================
     FORM FOCUS STATES
     (CSS handles focus ring; JS adds .is-focused
     class on parent .form__group for label animation)
     ============================================= */
  const formFields = document.querySelectorAll('.form__input, .form__textarea, .form__select');

  formFields.forEach(function (field) {
    const group = field.closest('.form__group');
    if (!group) return;

    field.addEventListener('focus', function () {
      group.classList.add('is-focused');
    });

    field.addEventListener('blur', function () {
      group.classList.remove('is-focused');
      if (field.value.trim() !== '') {
        group.classList.add('has-value');
      } else {
        group.classList.remove('has-value');
      }
    });
  });

  /* =============================================
     FORM SUBMIT (placeholder — no backend)
     ============================================= */
  const form = document.getElementById('contacto-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('.form__submit');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Enviado ✓';
        btn.disabled = true;
        btn.style.backgroundColor = 'var(--gama-03)';
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
          btn.style.backgroundColor = '';
          form.reset();
          form.querySelectorAll('.form__group').forEach(function (g) {
            g.classList.remove('has-value', 'is-focused');
          });
        }, 2800);
      }
    });
  }

  /* Smooth scroll handled natively via CSS scroll-behavior: smooth on html.
     scroll-margin-top on [id] elements compensates for the fixed nav. */

  /* =============================================
     GAMAS — carrusel scroll lateral
     ============================================= */
  const gamaWrapper = document.getElementById('gamas-sticky-wrapper');
  const gamaTrack = document.getElementById('gamas-track');

  if (gamaWrapper && gamaTrack) {
    const gamaSlides = Array.from(gamaTrack.querySelectorAll('.gama-slide'));
    const gamaProgressItems = Array.from(document.querySelectorAll('.gamas-progress__item'));
    const gamaCount = gamaSlides.length;
    let gamaWrapperTop = 0;
    let gamaCurrentIdx = 0;

    function gamaCachePos() {
      gamaWrapperTop = gamaWrapper.getBoundingClientRect().top + window.scrollY;
    }

    const gamaSticky = document.querySelector('.gamas-sticky');

    function gamaSetActive(idx) {
      if (idx === gamaCurrentIdx) return;
      gamaCurrentIdx = idx;
      gamaSlides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      gamaProgressItems.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });
      if (gamaSticky) {
        gamaSticky.setAttribute('data-active-slide', String(idx));
      }
    }

    function gamaUpdate() {
      if (window.innerWidth <= 768) {
        gamaTrack.style.transform = '';
        return;
      }
      const raw = (window.scrollY - gamaWrapperTop) / window.innerHeight;
      const progress = Math.max(0, Math.min(gamaCount - 1, raw));
      gamaTrack.style.transform = 'translateX(-' + (progress * (100 / gamaCount)).toFixed(4) + '%)';
      gamaSetActive(Math.round(progress));
    }

    gamaCachePos();
    if (gamaSticky) gamaSticky.setAttribute('data-active-slide', '0');
    window.addEventListener('scroll', gamaUpdate, { passive: true });
    window.addEventListener('resize', function () { gamaCachePos(); gamaUpdate(); });
    gamaUpdate();

    gamaProgressItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var idx = parseInt(item.getAttribute('data-index'), 10);
        if (isNaN(idx)) return;
        if (window.innerWidth <= 768) {
          gamaSlides[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          gamaCachePos();
          window.scrollTo({ top: gamaWrapperTop + idx * window.innerHeight, behavior: 'smooth' });
        }
      });
    });
  }

  /* =============================================
     STAT COUNTER — anima números al entrar en viewport
     ============================================= */
  var statValues = document.querySelectorAll('.stat__value[data-count]');

  if ('IntersectionObserver' in window && statValues.length > 0) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);

        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1600;
        var start = null;

        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

        function step(timestamp) {
          if (!start) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          el.textContent = Math.round(easeOut(progress) * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    statValues.forEach(function (el) { counterObserver.observe(el); });
  }

})();
