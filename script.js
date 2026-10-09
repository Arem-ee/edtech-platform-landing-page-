/**
 * EdTech Nigeria Landing Page - Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ==========================================================================
     1. NAVBAR: Scroll 40px Border + Mobile Menu + Smooth Scroll
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const navHamburger = document.getElementById('navHamburger');
  const navMobilePanel = document.getElementById('navMobilePanel');

  // After scrolling 40px, navbar gains bottom border
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Mobile Hamburger Toggle
  function closeMobileNav() {
    if (!navHamburger || !navMobilePanel) return;
    navHamburger.setAttribute('aria-expanded', 'false');
    navMobilePanel.classList.remove('is-open');
    navMobilePanel.setAttribute('aria-hidden', 'true');
  }

  function toggleMobileNav() {
    if (!navHamburger || !navMobilePanel) return;
    const isExpanded = navHamburger.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileNav();
    } else {
      navHamburger.setAttribute('aria-expanded', 'true');
      navMobilePanel.classList.add('is-open');
      navMobilePanel.setAttribute('aria-hidden', 'false');
    }
  }

  if (navHamburger) {
    navHamburger.addEventListener('click', toggleMobileNav);
  }

  // Close mobile nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
    }
  });

  // Close mobile nav when clicking any link
  if (navMobilePanel) {
    const mobileLinks = navMobilePanel.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ==========================================================================
     2. HERO ANIMATIONS: Word-by-Word + Character Entrance + Mouse Parallax
     ========================================================================== */
  const heroHeadline = document.getElementById('heroHeadline');
  const studentItems = document.querySelectorAll('.hero-student-item');

  if (heroHeadline) {
    const rawText = heroHeadline.textContent.trim();
    const words = rawText.split(/\s+/);
    heroHeadline.innerHTML = '';

    words.forEach((word) => {
      const span = document.createElement('span');
      span.className = 'hero-word';
      span.textContent = word;
      heroHeadline.appendChild(span);
    });

    const wordSpans = heroHeadline.querySelectorAll('.hero-word');

    if (prefersReducedMotion) {
      wordSpans.forEach(span => span.classList.add('is-revealed'));
      studentItems.forEach(item => item.classList.add('is-entered'));
    } else {
      // Word-by-word reveal: 70ms stagger, 700ms each
      wordSpans.forEach((span, index) => {
        setTimeout(() => {
          span.classList.add('is-revealed');
        }, index * 70);
      });

      // Characters enter one by one: 120ms stagger
      const headlineLeadDuration = Math.max(250, wordSpans.length * 70 + 150);
      setTimeout(() => {
        studentItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('is-entered');
            setTimeout(() => {
              item.classList.add('has-idle');
            }, 750);
          }, index * 120);
        });
      }, headlineLeadDuration);
    }
  }

  // Hero Mouse Parallax (4-14px shift; disabled on touch devices)
  const heroSection = document.getElementById('hero');
  if (isFinePointer && !prefersReducedMotion && heroSection) {
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let parallaxRaf = null;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = relX;
      targetY = relY;

      if (!parallaxRaf) {
        parallaxRaf = requestAnimationFrame(updateParallax);
      }
    });

    function updateParallax() {
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;

      studentItems.forEach((item) => {
        const depth = parseFloat(item.getAttribute('data-depth') || '0.08');
        const shiftX = (mouseX * depth * 90).toFixed(2);
        const shiftY = (mouseY * depth * 75).toFixed(2);
        item.style.setProperty('--px-x', `${shiftX}px`);
        item.style.setProperty('--px-y', `${shiftY}px`);
      });

      if (Math.abs(targetX - mouseX) > 0.001 || Math.abs(targetY - mouseY) > 0.001) {
        parallaxRaf = requestAnimationFrame(updateParallax);
      } else {
        parallaxRaf = null;
      }
    }
  }

  /* ==========================================================================
     3. SCREENSHOTS MARQUEE (Infinite Loop with Smooth Hover Deceleration)
     ========================================================================== */
  const trackWrapper = document.getElementById('screenshotsTrackWrapper');
  const track = document.getElementById('screenshotsTrack');

  if (track && trackWrapper && !prefersReducedMotion) {
    let currentX = 0;
    const baseSpeed = 0.85;
    let targetSpeed = baseSpeed;
    let currentSpeed = baseSpeed;

    trackWrapper.addEventListener('mouseenter', () => {
      targetSpeed = 0; // Smooth ease-down
    });

    trackWrapper.addEventListener('mouseleave', () => {
      targetSpeed = baseSpeed; // Smooth ease-up
    });

    function animateMarquee() {
      currentSpeed += (targetSpeed - currentSpeed) * 0.06;
      currentX -= currentSpeed;

      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0 && Math.abs(currentX) >= halfWidth) {
        currentX += halfWidth;
      }

      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      requestAnimationFrame(animateMarquee);
    }

    requestAnimationFrame(animateMarquee);
  }

  /* ==========================================================================
     4. REVEAL ANIMATIONS (Never Leave Content Hidden)
     ========================================================================== */
  const observeTargets = [
    document.querySelector('.js-reveal-map'),
    document.querySelector('.js-reveal-group'),
    document.getElementById('examsGrid'),
    document.getElementById('blogGrid'),
    document.querySelector('.js-reveal-table'),
    ...document.querySelectorAll('.js-reveal-item')
  ].filter(Boolean);

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    // 1. Immediately reveal elements already in the viewport
    const viewportHeight = window.innerHeight;
    observeTargets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.95 && rect.bottom > 0) {
        el.classList.add('is-revealed');
        // Handle child elements
        if (el.classList.contains('js-reveal-group')) {
          el.querySelectorAll('.story-block').forEach(b => b.classList.add('is-revealed'));
        } else if (el.id === 'examsGrid') {
          el.querySelectorAll('.exam-card').forEach(c => c.classList.add('is-revealed'));
        } else if (el.id === 'blogGrid') {
          el.querySelectorAll('.blog-card').forEach(b => b.classList.add('is-revealed'));
        } else if (el.classList.contains('js-reveal-table')) {
          el.querySelectorAll('.table-row').forEach(r => r.classList.add('is-revealed'));
        } else if (el.classList.contains('js-reveal-map')) {
          el.classList.add('has-sway');
        }
      }
    });

    // 2. Now activate observer styles for off-screen elements
    document.body.classList.add('js-observer-ready');

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;

        if (target.classList.contains('js-reveal-map')) {
          target.classList.add('is-revealed');
          setTimeout(() => {
            target.classList.add('has-sway');
          }, 1150);
        } else if (target.classList.contains('js-reveal-group')) {
          const blocks = target.querySelectorAll('.story-block');
          blocks.forEach((block, idx) => {
            setTimeout(() => block.classList.add('is-revealed'), idx * 150);
          });
        } else if (target.id === 'examsGrid') {
          const cards = target.querySelectorAll('.exam-card');
          cards.forEach((card, idx) => {
            setTimeout(() => card.classList.add('is-revealed'), idx * 90);
          });
        } else if (target.id === 'blogGrid') {
          const cards = target.querySelectorAll('.blog-card');
          cards.forEach((card, idx) => {
            setTimeout(() => card.classList.add('is-revealed'), idx * 120);
          });
        } else if (target.classList.contains('js-reveal-table')) {
          const rows = target.querySelectorAll('.table-row');
          rows.forEach((row, idx) => {
            setTimeout(() => row.classList.add('is-revealed'), idx * 80);
          });
        } else if (target.classList.contains('js-reveal-item')) {
          target.classList.add('is-revealed');
        }

        obs.unobserve(target);
      });
    }, { threshold: 0.15 });

    observeTargets.forEach(el => observer.observe(el));
  } else {
    // Fallback: keep all content visible
    observeTargets.forEach(el => el.classList.add('is-revealed'));
  }
});
