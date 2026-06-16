/* ============ Global JavaScript ============ */
document.addEventListener('DOMContentLoaded', () => {

  // Preloader
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => setTimeout(() => preloader.classList.add('hidden'), 800));
    setTimeout(() => preloader.classList.add('hidden'), 3000); // fallback
  }

  // Force page to load at the top
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Sticky Navbar with Auto-Hide
  const navbar = document.querySelector('.navbar');
  const scrollThreshold = 50;
  let lastScrollY = window.scrollY;

  function handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Auto-hide navbar on scroll down, show on scroll up
    if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;

    // Add background when scrolled
    if (currentScrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Back to top button
    const topBtn = document.querySelector('.float-btn.top');
    if (topBtn) {
      if (currentScrollY > 500) topBtn.classList.add('visible');
      else topBtn.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // Mobile Menu Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navCta = document.querySelector('.nav-cta');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      if (navCta) navCta.classList.toggle('open');
    });
    // Close on link click
    document.querySelectorAll('.nav-links a:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        if (navCta) navCta.classList.remove('open');
      });
    });
  }

  // Mobile Dropdown Accordion Toggle
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const parent = this.parentElement;
        parent.classList.toggle('active');
      }
    });
  }

  // Scroll Reveal Animation
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('active'), index * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      e.preventDefault();
      const target = document.querySelector(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Back to top
  const topBtn = document.querySelector('.float-btn.top');
  if (topBtn) {
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Counter Animation
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current) + suffix;
        }, 25);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ============ LOGIN MODAL ============
  // Tab switching
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.login-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('tab-' + tab.getAttribute('data-tab'));
      if (target) target.classList.add('active');
    });
  });

  // Close modal on overlay click
  const modalOverlay = document.getElementById('login-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeLoginModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoginModal();
  });

  // User menu dropdown
  document.querySelectorAll('.user-menu-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      trigger.closest('.user-menu').classList.toggle('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.user-menu').forEach(m => m.classList.remove('open'));
  });

  // Check login state on load
  checkLoginState();
});

// ============ LOGIN FUNCTIONS ============
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  if (email && password) {
    const user = { email, name: email.split('@')[0], loggedIn: true };
    localStorage.setItem('lookupp_user', JSON.stringify(user));
    closeLoginModal();
    showToast('success', '✅', 'Login successful! Welcome back.');
    checkLoginState();
    form.reset();
  }
}

function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('input');
  const name = inputs[0].value;
  const email = inputs[1].value;

  if (name && email) {
    const user = { email, name, loggedIn: true };
    localStorage.setItem('lookupp_user', JSON.stringify(user));
    closeLoginModal();
    showToast('success', '🎉', 'Account created! Welcome to LookUPp.');
    checkLoginState();
    form.reset();
  }
}

function handleLogout() {
  localStorage.removeItem('lookupp_user');
  showToast('success', '👋', 'Logged out successfully.');
  checkLoginState();
}

function checkLoginState() {
  const userData = localStorage.getItem('lookupp_user');
  const loginBtns = document.querySelectorAll('#login-btn');
  const navInners = document.querySelectorAll('.nav-inner');

  navInners.forEach(inner => {
    // Remove the old dynamic menu if it exists
    const existingMenu = inner.querySelector('.user-menu');
    if (existingMenu) existingMenu.remove();
    
    // Also clean up any legacy user-menu in nav-cta
    const cta = inner.querySelector('.nav-cta');
    if (cta) {
      const legacyMenu = cta.querySelector('.user-menu');
      if (legacyMenu) legacyMenu.remove();
    }

    const loginBtn = inner.querySelector('#login-btn');

    if (userData) {
      const user = JSON.parse(userData);
      const firstName = user.name ? user.name.split(' ')[0] : 'Profile';
      if (loginBtn) loginBtn.style.display = 'none';

      inner.classList.add('logged-in');

      const menuHTML = document.createElement('div');
      menuHTML.className = 'user-menu'; // Used for identification
      const profilePic = user.profilePic 
        ? `<img src="${user.profilePic}" style="width:100%; height:100%; object-fit:cover;">` 
        : `<span>${firstName.charAt(0).toUpperCase()}</span>`;

      menuHTML.innerHTML = `
        <a href="profile.html" class="nav-user-avatar" title="My Profile">${profilePic}</a>
      `;
      inner.appendChild(menuHTML);
    } else {
      inner.classList.remove('logged-in');
      if (loginBtn) loginBtn.style.display = '';
    }
  });
}

function showToast(type, icon, text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.className = 'toast-notification ' + type;
  toast.querySelector('.toast-icon').textContent = icon;
  toast.querySelector('.toast-text').textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
