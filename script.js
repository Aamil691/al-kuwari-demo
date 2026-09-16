document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('reveal-ready');

  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const header = document.querySelector('.site-header');

  if (header) {
    const updateHeaderState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  if (finePointer && !reduceMotion) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursorGlow);

    const hero = document.querySelector('.hero');
    const parallaxItems = hero ? hero.querySelectorAll('.hero-image-card, .floating-card') : [];
    const tiltItems = document.querySelectorAll('.service-card, .info-card, .category-item, .contact-card, .contact-form');
    const magneticButtons = document.querySelectorAll('.btn-primary');
    const nav = document.querySelector('.main-nav');
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let targetX = pointerX;
    let targetY = pointerY;
    let framePending = false;

    const renderPointerEffects = () => {
      pointerX += (targetX - pointerX) * 0.14;
      pointerY += (targetY - pointerY) * 0.14;
      cursorGlow.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const x = ((pointerX - rect.left) / rect.width - 0.5) * 2;
        const y = ((pointerY - rect.top) / rect.height - 0.5) * 2;
        hero.style.setProperty('--pointer-x', `${x * 18}px`);
        hero.style.setProperty('--pointer-y', `${y * 14}px`);
        parallaxItems.forEach((item, index) => {
          const depth = index === 0 ? 0.7 : 1.15;
          item.style.setProperty('--parallax-x', `${x * depth * -10}px`);
          item.style.setProperty('--parallax-y', `${y * depth * -8}px`);
        });
      }
      framePending = false;
    };

    const requestPointerFrame = () => {
      if (!framePending) {
        framePending = true;
        requestAnimationFrame(renderPointerEffects);
      }
    };

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      requestPointerFrame();
    }, { passive: true });

    tiltItems.forEach((item) => {
      item.classList.add('tilt-card');
      item.addEventListener('pointermove', (event) => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 8;
        const rotateX = (0.5 - y) * 8;
        item.style.setProperty('--mouse-x', `${x * 100}%`);
        item.style.setProperty('--mouse-y', `${y * 100}%`);
        item.style.setProperty('--tilt-x', `${rotateX}deg`);
        item.style.setProperty('--tilt-y', `${rotateY}deg`);
      });
      item.addEventListener('pointerleave', () => {
        item.style.setProperty('--tilt-x', '0deg');
        item.style.setProperty('--tilt-y', '0deg');
      });
    });

    magneticButtons.forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.08;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.08;
        button.style.setProperty('--magnetic-x', `${x}px`);
        button.style.setProperty('--magnetic-y', `${y}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--magnetic-x', '0px');
        button.style.setProperty('--magnetic-y', '0px');
      });
    });

    if (nav) {
      const navIndicator = document.createElement('span');
      navIndicator.className = 'nav-hover-indicator';
      navIndicator.setAttribute('aria-hidden', 'true');
      nav.appendChild(navIndicator);
      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('pointerenter', () => {
          const navRect = nav.getBoundingClientRect();
          const linkRect = link.getBoundingClientRect();
          navIndicator.style.setProperty('--indicator-x', `${linkRect.left - navRect.left}px`);
          navIndicator.style.setProperty('--indicator-width', `${linkRect.width}px`);
          navIndicator.classList.add('is-visible');
        });
      });
      nav.addEventListener('pointerleave', () => navIndicator.classList.remove('is-visible'));
    }
  }

  document.querySelectorAll('.btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      ripple.className = 'button-ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 550);
    });
  });

  const revealItems = document.querySelectorAll('main > section:not(.hero), .service-card, .info-card, .category-item, .service-feature');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    if (item.matches('.service-card, .info-card, .category-item')) {
      item.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
    }
    revealObserver.observe(item);
  });

  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);

  const updateScrollProgress = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  };

  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  const form = document.querySelector('.contact-form');
  const statusText = document.querySelector('.form-status');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const fields = {
        name: form.querySelector('#name'),
        email: form.querySelector('#email'),
        subject: form.querySelector('#subject'),
        message: form.querySelector('#message')
      };

      let valid = true;

      Object.entries(fields).forEach(([key, field]) => {
        const errorNode = field.closest('.form-row').querySelector('.error-message');
        const value = field.value.trim();

        if (!value) {
          valid = false;
          errorNode.textContent = 'This field is required.';
          field.setAttribute('aria-invalid', 'true');
          return;
        }

        if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          valid = false;
          errorNode.textContent = 'Please enter a valid email address.';
          field.setAttribute('aria-invalid', 'true');
          return;
        }

        errorNode.textContent = '';
        field.removeAttribute('aria-invalid');
      });

      if (!valid) {
        if (statusText) {
          statusText.textContent = 'Please correct the highlighted fields and try again.';
          statusText.style.color = '#c92c2c';
        }
        return;
      }

      if (statusText) {
        statusText.textContent = 'Thank you. Your enquiry has been prepared successfully.';
        statusText.style.color = '#0f7a4d';
      }

      form.reset();
    });
  }
});
