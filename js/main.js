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
      if (event.key === 'Tab' && navLinks.classList.contains('open')) {
        const focusable = [...navLinks.querySelectorAll('a[href], button:not([disabled])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && doc.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && doc.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
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

  /* The homepage pathway behaves as a compact, keyboard-operable stage
     explorer. Its text remains fully available without JavaScript. */
  const signalTabs = [...doc.querySelectorAll('.signal-stage[role="tab"]')];
  const signalPanel = doc.getElementById('signal-panel');
  if (signalTabs.length && signalPanel) {
    const kicker = signalPanel.querySelector('[data-signal-kicker]');
    const title = signalPanel.querySelector('[data-signal-title]');
    const copy = signalPanel.querySelector('[data-signal-copy]');

    const selectSignalStage = (tab, { moveFocus = false } = {}) => {
      signalTabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      signalPanel.setAttribute('aria-labelledby', tab.id);
      kicker.textContent = tab.dataset.kicker;
      copy.textContent = tab.dataset.copy;
      const [lineOne, lineTwo] = tab.dataset.title.split('|');
      title.replaceChildren(doc.createTextNode(lineOne), doc.createElement('br'), doc.createTextNode(lineTwo || ''));
      if (moveFocus) tab.focus();
    };

    signalTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectSignalStage(tab));
      tab.addEventListener('keydown', event => {
        let nextIndex = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % signalTabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + signalTabs.length) % signalTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = signalTabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        selectSignalStage(signalTabs[nextIndex], { moveFocus: true });
      });
    });
  }

  doc.querySelectorAll('.service-filter').forEach(filter => {
    const grid = filter.parentElement.querySelector('[data-filter-grid]');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('[data-category]')];
    const status = doc.createElement('span');
    status.className = 'filter-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    filter.append(status);

    const updateFilterStatus = () => {
      const visible = cards.filter(card => !card.hidden).length;
      status.textContent = `${visible} ${visible === 1 ? 'service' : 'services'}`;
    };
    updateFilterStatus();

    filter.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      const category = button.dataset.filter;
      grid.classList.toggle('is-filtered', category !== 'all');

      filter.querySelectorAll('[data-filter]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      cards.forEach(card => {
        const visible = category === 'all' || card.dataset.category === category;
        card.hidden = !visible;
      });
      updateFilterStatus();
    });
  });

  /* Service-detail pages gain a generated sticky navigator without changing
     their canonical content, structured data, or form contracts. */
  const serviceMain = doc.querySelector('body.service-detail main');
  if (serviceMain) {
    const hero = serviceMain.querySelector(':scope > .hero');
    const sections = [...serviceMain.querySelectorAll(':scope > section:not(.hero)')];
    if (hero && sections.length) {
      const wrapper = doc.createElement('div');
      wrapper.className = 'section-rail-wrap';
      const rail = doc.createElement('nav');
      rail.className = 'container section-rail';
      rail.setAttribute('aria-label', 'On this page');
      const label = doc.createElement('span');
      label.className = 'section-rail__label';
      label.textContent = 'On this page';
      rail.append(label);

      const links = sections.map((section, index) => {
        const heading = section.querySelector('h2, h3');
        section.id = section.id || `service-section-${index + 1}`;
        const link = doc.createElement('a');
        link.href = `#${section.id}`;
        link.textContent = heading?.textContent || `Section ${index + 1}`;
        if (index === 0) link.setAttribute('aria-current', 'location');
        rail.append(link);
        return link;
      });

      wrapper.append(rail);
      hero.insertAdjacentElement('afterend', wrapper);

      if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(entries => {
          const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;
          links.forEach(link => {
            if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }, { rootMargin: '-32% 0px -58%', threshold: [0, .1, .3] });
        sections.forEach(section => sectionObserver.observe(section));
      }
    }
  }

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

    form.querySelectorAll('[required]').forEach(field => {
      field.setAttribute('aria-required', 'true');
      if (!field.id) return;
      const label = form.querySelector(`label[for="${CSS.escape(field.id)}"]`);
      label?.classList.add('is-required');
    });

    form.addEventListener('submit', () => {
      const submit = form.querySelector('[type="submit"]');
      if (!submit || !form.checkValidity()) return;
      let status = form.querySelector('.form-status');
      if (!status) {
        status = doc.createElement('p');
        status.className = 'form-status';
        status.setAttribute('role', 'status');
        submit.insertAdjacentElement('afterend', status);
      }
      status.textContent = 'Submitting your details securely…';
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
