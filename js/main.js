/**
 * ============================================================
 *  PULIZIE PRO — Script principale
 *  Vanilla JS puro — Zero dipendenze esterne
 *  Funzionalità:
 *    1. Header sticky con shadow al scroll
 *    2. Hamburger menu mobile
 *    3. Smooth scroll per ancore
 *    4. Scroll Reveal (IntersectionObserver)
 *    5. CountUp animato (IntersectionObserver)
 *    6. Before/After slider trascinabile (touch + mouse)
 *    7. FAQ accordion smooth
 *    8. Form di contatto con validazione
 *    9. Anno footer dinamico
 *   10. Chiudi menu al click su link
 * ============================================================
 */

'use strict';

/* ============================================================
   UTILITY: aspetta il DOM
============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Aggiorna anno nel footer
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();


  /* ============================================================
     1. HEADER STICKY — Aggiunge classe .scrolled dopo 50px
  ============================================================ */
  (function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScroll = 0;
    let ticking    = false;

    function onScroll() {
      lastScroll = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          if (lastScroll > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // controlla stato iniziale
  })();


  /* ============================================================
     2. HAMBURGER MENU MOBILE
  ============================================================ */
  (function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const mainNav   = document.getElementById('mainNav');
    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mainNav.classList.toggle('nav-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      // Impedisce scroll del body quando menu è aperto
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Chiude il menu premendo Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        hamburger.classList.remove('open');
        mainNav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  })();


  /* ============================================================
     3. SMOOTH SCROLL per i link ancora + chiude menu mobile
  ============================================================ */
  (function initSmoothScroll() {
    const hamburger = document.getElementById('hamburger');
    const mainNav   = document.getElementById('mainNav');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        // Chiude menu mobile se aperto
        if (hamburger && mainNav) {
          hamburger.classList.remove('open');
          mainNav.classList.remove('nav-open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }

        // Calcola offset tenendo conto dell'header fisso
        const headerH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
          10
        ) || 72;

        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        // Aggiorna focus per accessibilità
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  })();


  /* ============================================================
     4. SCROLL REVEAL — Elementi con classe .reveal-up
        Entrano da sotto con fade + translateY
  ============================================================ */
  (function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal-up');
    if (!elements.length) return;

    // Se il browser non supporta IntersectionObserver, mostra tutto
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Una sola volta
          }
        });
      },
      {
        threshold: 0.12,  // Si attiva quando il 12% è visibile
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach(el => observer.observe(el));
  })();


  /* ============================================================
     5. COUNTUP ANIMATO — Elementi con classe .countup
        data-target: numero finale
        data-suffix: suffisso (es. "+", "%", "/5")
        Usa IntersectionObserver per attivarsi al viewport
  ============================================================ */
  (function initCountUp() {
    const counters = document.querySelectorAll('.countup');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(el => {
        el.textContent = el.dataset.target + (el.dataset.suffix || '');
      });
      return;
    }

    /**
     * Anima un contatore da 0 a target in `duration` ms
     * con easing easeOutExpo
     */
    function animateCounter(el, target, suffix, duration = 1800) {
      const start     = performance.now();
      const startVal  = 0;

      // Easing: easeOutExpo
      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easedVal = easeOutExpo(progress);
        const current  = Math.round(startVal + (target - startVal) * easedVal);

        // Formattazione: se il target ha decimali (es. 5.0) mantieni coerenza
        el.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix; // Assicura valore finale esatto
        }
      }

      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseFloat(el.dataset.target) || 0;
            const suffix = el.dataset.suffix || '';
            animateCounter(el, target, suffix);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  })();


  /* ============================================================
     6. BEFORE/AFTER SLIDER — Trascinabile con mouse e touch
        Funziona su tutti gli elementi .ba-slider
  ============================================================ */
  (function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.ba-slider');
    if (!sliders.length) return;

    sliders.forEach(slider => {
      const divider = slider.querySelector('.ba-divider');
      const after   = slider.querySelector('.ba-after');
      if (!divider || !after) return;

      let isDragging = false;
      let currentPos = 50; // percentuale 0–100

      /**
       * Aggiorna la posizione del divisore e il clip-path dell'after
       * @param {number} pos — percentuale 0–100
       */
      function setPosition(pos) {
        // Clamp tra 1% e 99% per mantenere visibili entrambe le label
        pos = Math.max(1, Math.min(99, pos));
        currentPos = pos;

        // Muove il divisore
        divider.style.left = pos + '%';

        // Rivela la parte "after" tagliando da destra
        // clip-path: inset(top right bottom left)
        after.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;

        // Aggiorna attributo ARIA per accessibilità
        divider.setAttribute('aria-valuenow', Math.round(pos));
      }

      /**
       * Calcola la percentuale dalla posizione X del cursore/touch
       * @param {number} clientX
       * @returns {number} percentuale 0–100
       */
      function getPercent(clientX) {
        const rect  = slider.getBoundingClientRect();
        const x     = clientX - rect.left;
        return (x / rect.width) * 100;
      }

      // ---- Mouse events ----
      divider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        slider.classList.add('dragging');
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setPosition(getPercent(e.clientX));
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          slider.classList.remove('dragging');
        }
      });

      // ---- Touch events ----
      divider.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
      }, { passive: false });

      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition(getPercent(e.touches[0].clientX));
      }, { passive: false });

      document.addEventListener('touchend', () => {
        isDragging = false;
      });

      // ---- Click diretto sullo slider (non sul handle) ----
      slider.addEventListener('click', (e) => {
        // Evita il doppio trigger quando si clicca sul divisore
        if (e.target === divider || divider.contains(e.target)) return;
        setPosition(getPercent(e.clientX));
      });

      // ---- Tastiera: accessibilità ----
      // Frecce sinistra/destra per muovere il divisore
      divider.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowLeft')  { e.preventDefault(); setPosition(currentPos - step); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setPosition(currentPos + step); }
        if (e.key === 'Home')       { e.preventDefault(); setPosition(1); }
        if (e.key === 'End')        { e.preventDefault(); setPosition(99); }
      });

      // Inizializzazione al 50%
      setPosition(50);
    });
  })();


  /* ============================================================
     7. FAQ ACCORDION
        Toggle classe .open sull'elemento .faq-item
  ============================================================ */
  (function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-item__question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen     = item.classList.contains('open');
        const answerId   = question.getAttribute('aria-controls');

        // Chiude tutti gli altri (comportamento accordion classico)
        // Rimuovi questo blocco se vuoi che più FAQ possano essere aperte insieme
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            const otherQ = otherItem.querySelector('.faq-item__question');
            if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle questo item
        item.classList.toggle('open', !isOpen);
        question.setAttribute('aria-expanded', String(!isOpen));

        // Scroll gentile se si apre fuori dallo schermo (mobile)
        if (!isOpen) {
          setTimeout(() => {
            const rect = item.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
              item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 420); // Aspetta la fine della transizione CSS
        }
      });
    });
  })();


  /* ============================================================
     8. FORM CONTATTO — Validazione base + feedback visivo
  ============================================================ */
  (function initContactForm() {
    const form        = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    if (!form || !formSuccess) return;

    /**
     * Validazione di un singolo campo
     * @param {HTMLElement} field
     * @returns {boolean}
     */
    function validateField(field) {
      const value = field.value.trim();
      let valid   = true;

      // Controlla required
      if (field.hasAttribute('required') && !value) {
        valid = false;
      }

      // Validazione email base
      if (field.type === 'email' && value) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }

      // Validazione telefono base (almeno 8 cifre)
      if (field.type === 'tel' && value) {
        valid = value.replace(/[\s\-\+\(\)]/g, '').length >= 8;
      }

      field.classList.toggle('error', !valid);
      return valid;
    }

    // Validazione live al blur
    form.querySelectorAll('.form-input').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Valida tutti i campi
      let isFormValid = true;
      form.querySelectorAll('.form-input').forEach(field => {
        if (!validateField(field)) isFormValid = false;
      });

      if (!isFormValid) {
        // Focus sul primo campo non valido
        const firstError = form.querySelector('.form-input.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simula invio (in produzione: sostituisci con fetch/API reale)
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Invio in corso...';

      // Simulazione ritardo server
      setTimeout(() => {
        form.reset();
        form.querySelectorAll('.form-input').forEach(f => f.classList.remove('error'));
        formSuccess.removeAttribute('hidden');
        submitBtn.disabled     = false;
        submitBtn.innerHTML    = 'Invia Richiesta <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8 H14 M10 4 L14 8 L10 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        // Scroll al messaggio di successo
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Nasconde il messaggio dopo 6 secondi
        setTimeout(() => formSuccess.setAttribute('hidden', ''), 6000);
      }, 1200);
    });
  })();


  /* ============================================================
     9. HOVER CARDS SERVIZI — Aggiunge classe per effetto JS
        (gli effetti principali sono CSS, questo è un bonus)
  ============================================================ */
  (function initServiceCards() {
    const cards = document.querySelectorAll('.service-card');

    cards.forEach(card => {
      // Effetto parallasse leggero sull'icona al mousemove
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y      = (e.clientY - rect.top - rect.height / 2) / rect.height;
        const icon   = card.querySelector('.service-card__icon');
        if (icon) {
          icon.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('.service-card__icon');
        if (icon) {
          icon.style.transform = 'translate(0, 0)';
          icon.style.transition = 'transform 0.4s ease';
        }
      });

      card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('.service-card__icon');
        if (icon) icon.style.transition = '';
      });
    });
  })();


  /* ============================================================
     10. ACTIVE NAV LINK — Evidenzia il link della sezione attiva
         usando IntersectionObserver
  ============================================================ */
  (function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              link.classList.toggle('active', href === `#${id}`);

              // Stile aggiuntivo per link attivo (via JS, per non usare CSS puro che non conosce lo stato)
              if (href === `#${id}`) {
                link.style.color = '';
                link.querySelectorAll('&::after'); // Il CSS gestisce l'underline via classe
              }
            });
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: `-${72}px 0px -40% 0px`
      }
    );

    sections.forEach(section => observer.observe(section));
  })();


  /* ============================================================
     11. LAZY LOAD PLACEHOLDER MAP — Anima la mappa al viewport
  ============================================================ */
  (function initMapAnimation() {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (!mapPlaceholder) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            mapPlaceholder.style.animation = 'none';
            const pin = mapPlaceholder.querySelector('.map-pin');
            if (pin) {
              pin.style.animationPlayState = 'running';
            }
            observer.unobserve(mapPlaceholder);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(mapPlaceholder);
  })();


  /* ============================================================
     12. SMOOTH PARALLAX HERO (leggero, solo desktop)
         Muove leggermente il background dell'hero allo scroll
  ============================================================ */
  (function initHeroParallax() {
    // Solo su schermi grandi e se l'utente non preferisce reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.innerWidth < 900) return;

    const heroBg = document.querySelector('.hero__bg');
    if (!heroBg) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Parallasse al 30% della velocità di scroll
          heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();


  /* ============================================================
     INIT COMPLETO — Log di conferma (rimuovere in produzione)
  ============================================================ */
  console.log(
    '%c✓ Valentini Pulizie Template — Tutti i moduli inizializzati correttamente.',
    'color: #4A90D9; font-weight: 700; font-size: 13px;'
  );

}); // Fine DOMContentLoaded
