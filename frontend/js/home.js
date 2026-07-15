/* ============ Home Page JavaScript ============ */
document.addEventListener('DOMContentLoaded', () => {

  // Typed text effect for hero
  const typedEl = document.querySelector('.typed-text');
  if (typedEl) {
    let texts = [
      'Digital Marketing Solutions',
      'Creative Branding Services',
      'Website & App Development',
      'Performance Marketing',
      'Business Growth Partner'
    ];
    
    // Fetch dynamic texts if available
    fetch('/api/content').then(r=>r.json()).then(data => {
      if(data?.home?.hero?.typingLines) {
        texts = data.home.hero.typingLines.split(',').map(s=>s.trim()).filter(s=>s);
      }
      
      let textIdx = 0, charIdx = 0, isDeleting = false;
      function typeEffect() {
        const current = texts[textIdx] || '';
        if (isDeleting) {
          typedEl.textContent = current.substring(0, charIdx--);
          if (charIdx < 0) { isDeleting = false; textIdx = (textIdx + 1) % texts.length; setTimeout(typeEffect, 500); return; }
        } else {
          typedEl.textContent = current.substring(0, charIdx++);
          if (charIdx > current.length) { isDeleting = true; setTimeout(typeEffect, 2000); return; }
        }
        setTimeout(typeEffect, isDeleting ? 30 : 80);
      }
      setTimeout(typeEffect, 1000);
    }).catch(() => {
      // Fallback if fetch fails
      let textIdx = 0, charIdx = 0, isDeleting = false;
      function typeEffect() {
        const current = texts[textIdx];
        if (isDeleting) {
          typedEl.textContent = current.substring(0, charIdx--);
          if (charIdx < 0) { isDeleting = false; textIdx = (textIdx + 1) % texts.length; setTimeout(typeEffect, 500); return; }
        } else {
          typedEl.textContent = current.substring(0, charIdx++);
          if (charIdx > current.length) { isDeleting = true; setTimeout(typeEffect, 2000); return; }
        }
        setTimeout(typeEffect, isDeleting ? 30 : 80);
      }
      setTimeout(typeEffect, 1000);
    });
  }

  // Particle background
  const particleContainer = document.querySelector('.particles');
  if (particleContainer) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 10 + 8) + 's';
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
      particleContainer.appendChild(p);
    }
  }

  // ============ PREMIUM SERVICE ACCORDION ============
  const accordion = document.getElementById('services-accordion');
  if (accordion) {
    const cards = accordion.querySelectorAll('.service-group-card');

    cards.forEach(card => {
      const header = card.querySelector('.sg-header');
      const body = card.querySelector('.sg-body');

      // Click handler on header only
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = card.classList.contains('open');

        // If clicking a lower card while an upper one is open,
        // the lower card should slide up to replace the upper card's position.
        const currentlyOpen = accordion.querySelector('.service-group-card.open');

        if (currentlyOpen && currentlyOpen !== card) {
          // Close the currently open card with collapse animation
          collapseCard(currentlyOpen, () => {
            // After collapse, open the clicked card
            if (!isOpen) {
              expandCard(card);
              // Smooth scroll the clicked card into view
              setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 100);
            }
          });
        } else if (isOpen) {
          // Toggle close
          collapseCard(card);
        } else {
          // Simply open
          expandCard(card);
        }
      });
    });
  }

  // Testimonial auto-scroll (optional subtle effect)
  const slider = document.querySelector('.testimonial-slider');
  if (slider) {
    let scrollPos = 0;
  }
});

// ============ ACCORDION ANIMATION FUNCTIONS ============

function expandCard(card) {
  const body = card.querySelector('.sg-body');
  if (!body) return;

  // Set height to auto measurement
  body.style.height = '0px';
  body.style.display = 'block';
  card.classList.add('open');

  // Get the natural height
  const targetHeight = body.scrollHeight;

  // Force reflow
  body.offsetHeight;

  // Animate to natural height
  requestAnimationFrame(() => {
    body.style.height = targetHeight + 'px';
  });

  // Clean up after animation
  const onEnd = () => {
    body.style.height = 'auto';
    body.removeEventListener('transitionend', onEnd);
  };
  body.addEventListener('transitionend', onEnd, { once: true });
}

function collapseCard(card, callback) {
  const body = card.querySelector('.sg-body');
  if (!body) return;

  // Set explicit height before collapsing
  body.style.height = body.scrollHeight + 'px';

  // Add collapsing visual effect
  card.classList.add('collapsing');

  // Force reflow
  body.offsetHeight;

  // Animate to 0
  requestAnimationFrame(() => {
    body.style.height = '0px';
    card.classList.remove('open');
  });

  // Clean up
  const onEnd = () => {
    card.classList.remove('collapsing');
    body.style.height = '';
    body.removeEventListener('transitionend', onEnd);
    if (callback) callback();
  };
  body.addEventListener('transitionend', onEnd, { once: true });
}

// Legacy support (no-op since we use event delegation now)
function toggleServiceGroup(card) {
  // Handled by accordion event listeners
}
