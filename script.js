/**
 * EdTech Nigeria Landing Page - Pure Vanilla Interactions
 * Adheres strictly to the specification and forbidden rules.
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ==========================================================================
     1. HERO ANIMATIONS: Headline Word-by-Word + Character Entrance + Parallax
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
      // Word by word reveal: 70ms stagger, 700ms each
      wordSpans.forEach((span, index) => {
        setTimeout(() => {
          span.classList.add('is-revealed');
        }, index * 70);
      });

      // Characters enter one by one: 120ms stagger, starts after brief headline lead
      const headlineLeadDuration = Math.max(300, wordSpans.length * 70 + 200);
      setTimeout(() => {
        studentItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('is-entered');
            
            // Enable idle motion after entry transition completes (700ms)
            setTimeout(() => {
              item.classList.add('has-idle');
            }, 750);
          }, index * 120);
        });
      }, headlineLeadDuration);
    }
  }

  // Hero Mouse Parallax (4-14px based on depth; disabled on touch devices)
  const heroSection = document.getElementById('hero');
  if (isFinePointer && !prefersReducedMotion && heroSection) {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let parallaxRaf = null;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
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
        // Multiplier yields 4px to 14px subtle shift
        const shiftX = (mouseX * depth * 85).toFixed(2);
        const shiftY = (mouseY * depth * 70).toFixed(2);
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
     2. SECTION 3: SCREENSHOTS SEAMLESS INFINITE MARQUEE WITH SMOOTH HOVER EASE
     ========================================================================== */
  const trackWrapper = document.getElementById('screenshotsTrackWrapper');
  const track = document.getElementById('screenshotsTrack');

  if (track && trackWrapper && !prefersReducedMotion) {
    let currentX = 0;
    const baseSpeed = 0.85; // About 50 seconds for full cycle
    let targetSpeed = baseSpeed;
    let currentSpeed = baseSpeed;
    let isHovered = false;

    trackWrapper.addEventListener('mouseenter', () => {
      isHovered = true;
      targetSpeed = 0; // Ease speed down smoothly
    });

    trackWrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      targetSpeed = baseSpeed; // Ease speed back up
    });

    function animateMarquee() {
      // Smooth deceleration/acceleration easing: 0.06 factor
      currentSpeed += (targetSpeed - currentSpeed) * 0.06;

      currentX -= currentSpeed;

      // Because panels are duplicated (Set 1 + Set 2), halfWidth is the reset point
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0 && Math.abs(currentX) >= halfWidth) {
        currentX += halfWidth;
      }

      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      requestAnimationFrame(animateMarquee);
    }

    // Start infinite loop
    requestAnimationFrame(animateMarquee);
  }

  /* ==========================================================================
     3. INTERSECTION OBSERVER: REVEALS (Threshold 0.2, Fire Once)
     ========================================================================== */
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;

      // Section 2: Map Illustration
      if (target.classList.contains('js-reveal-map')) {
        target.classList.add('is-revealed');
        // Start vertical sway after 1100ms entry transition completes
        setTimeout(() => {
          target.classList.add('has-sway');
        }, 1150);
      }

      // Section 2: Text blocks staggered by 150ms
      else if (target.classList.contains('js-reveal-group')) {
        const items = target.querySelectorAll('.story-block');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('is-revealed');
          }, index * 150);
        });
      }

      // Section 4: Exams Grid staggered by 90ms
      else if (target.id === 'examsGrid') {
        const cards = target.querySelectorAll('.js-reveal-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('is-revealed');
          }, index * 90);
        });
      }

      // Section 5: Blog Cards staggered
      else if (target.id === 'blogGrid') {
        const blogCards = target.querySelectorAll('.js-reveal-blog');
        blogCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('is-revealed');
          }, index * 120);
        });
      }

      // Section 6: Comparison Table Rows staggered by 80ms
      else if (target.classList.contains('js-reveal-table')) {
        const rows = target.querySelectorAll('.table-row');
        rows.forEach((row, index) => {
          setTimeout(() => {
            row.classList.add('is-revealed');
          }, index * 80);
        });
      }

      // General Reveal Items
      else if (target.classList.contains('js-reveal-item')) {
        target.classList.add('is-revealed');
      }

      // Unobserve once triggered (fires once, never replays)
      observer.unobserve(target);
    });
  }, observerOptions);

  // Register elements to observe
  const observeTargets = [
    document.querySelector('.js-reveal-map'),
    document.querySelector('.js-reveal-group'),
    document.getElementById('examsGrid'),
    document.getElementById('blogGrid'),
    document.querySelector('.js-reveal-table'),
    ...document.querySelectorAll('.js-reveal-item')
  ];

  observeTargets.forEach((el) => {
    if (el) revealObserver.observe(el);
  });
});
