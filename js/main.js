(() => {
  'use strict';

  const doc = document;
  const body = doc.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = doc.querySelector('.header');
  const mobileToggle = doc.querySelector('.mobile-toggle');
  const navLinks = doc.querySelector('.nav-links');

  /* Bring the shared legacy page header into the redesigned system without
     removing its useful no-JavaScript navigation. */
  if (header && !header.classList.contains('header--modern')) {
    header.classList.add('header--legacy-modern');
    const legacyLogo = header.querySelector('.navbar > .logo');
    const logoImage = legacyLogo?.querySelector('img');
    if (legacyLogo && logoImage) {
      const mark = doc.createElement('span');
      const copy = doc.createElement('span');
      mark.className = 'brand-mark';
      copy.className = 'brand-copy';
      logoImage.alt = '';
      mark.append(logoImage);
      copy.innerHTML = '<strong>TANITY Global</strong><small>Medical communications</small>';
      legacyLogo.replaceChildren(mark, copy);
      legacyLogo.className = 'brand';
      legacyLogo.setAttribute('aria-label', 'TANITY Global Med Comms home');
    }
  }

  if (navLinks) {
    navLinks.classList.add('nav-links--modern');
    if (!navLinks.id) navLinks.id = 'primary-navigation';
    navLinks.setAttribute('aria-label', 'Primary navigation');
  }

  const closeNavigation = ({ returnFocus = false } = {}) => {
    if (!navLinks || !mobileToggle) return;
    navLinks.classList.remove('open');
    body.classList.remove('nav-open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Open navigation');
    if (returnFocus) mobileToggle.focus();
  };

  if (mobileToggle && navLinks) {
    mobileToggle.setAttribute('aria-controls', navLinks.id);
    mobileToggle.setAttribute('aria-label', 'Open navigation');
    mobileToggle.innerHTML = '<span></span><span></span>';

    mobileToggle.addEventListener('click', () => {
      const willOpen = !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', willOpen);
      body.classList.toggle('nav-open', willOpen);
      mobileToggle.setAttribute('aria-expanded', String(willOpen));
      mobileToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
      if (willOpen) navLinks.querySelector('a')?.focus();
    });

    navLinks.addEventListener('click', event => {
      if (event.target.closest('a')) closeNavigation();
    });

    doc.addEventListener('click', event => {
      if (!navLinks.classList.contains('open')) return;
      if (!header.contains(event.target)) closeNavigation();
    });

    doc.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        closeNavigation({ returnFocus: true });
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeNavigation();
    });
  }

  if (header) {
    let ticking = false;
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
    updateHeader();
  }

  doc.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href').slice(1);
      const target = targetId ? doc.getElementById(targetId) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      closeNavigation();
    });
  });

  doc.querySelectorAll('.service-filter').forEach(filter => {
    const grid = filter.parentElement.querySelector('[data-filter-grid]');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('[data-category]')];

    filter.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      const category = button.dataset.filter;

      filter.querySelectorAll('[data-filter]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      cards.forEach(card => {
        const visible = category === 'all' || card.dataset.category === category;
        card.hidden = !visible;
      });
    });
  });

  /* Convert the existing FAQ markup into accessible disclosure controls. */
  doc.querySelectorAll('.faq-item').forEach((item, index) => {
    const title = item.querySelector(':scope > strong');
    const answer = item.querySelector(':scope > p');
    if (!title || !answer) return;

    const answerId = `faq-answer-${index + 1}`;
    const button = doc.createElement('button');
    button.className = 'faq-question';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', answerId);
    button.innerHTML = `<span>${title.textContent}</span><i aria-hidden="true"></i>`;

    answer.id = answerId;
    answer.hidden = true;
    title.replaceWith(button);

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      answer.hidden = !open;
      item.classList.toggle('is-open', open);
    });
  });

  doc.querySelectorAll('.form').forEach(form => {
    ['name', 'email'].forEach(name => {
      const field = form.elements.namedItem(name);
      if (field) field.required = true;
    });
    const message = form.querySelector('textarea');
    if (message) message.required = true;

    form.addEventListener('submit', () => {
      const submit = form.querySelector('[type="submit"]');
      if (!submit || !form.checkValidity()) return;
      submit.disabled = true;
      submit.dataset.label = submit.textContent;
      submit.textContent = 'Sending securely…';
      form.classList.add('is-submitting');
    });
  });

  doc.querySelectorAll('.legal').forEach(item => {
    item.textContent = item.textContent.replace(/©\s+\d{4}/, `© ${new Date().getFullYear()}`);
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const targets = doc.querySelectorAll('main section:not(.hero), .card, .step, .blog-card, .banner');
    doc.documentElement.classList.add('reveal-ready');
    targets.forEach((target, index) => {
      target.dataset.reveal = '';
      target.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px' });

    targets.forEach(target => observer.observe(target));
  }

  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    doc.querySelectorAll('[data-tilt]').forEach(element => {
      element.addEventListener('pointermove', event => {
        const bounds = element.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        element.style.setProperty('--tilt-x', `${(-y * 4).toFixed(2)}deg`);
        element.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
      });
      element.addEventListener('pointerleave', () => {
        element.style.setProperty('--tilt-x', '0deg');
        element.style.setProperty('--tilt-y', '0deg');
      });
    });
  }
})();
