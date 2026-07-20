/* ============ Global JavaScript ============ */
const originalFetch = window.fetch;
window.fetch = async function() {
  let [resource, config] = arguments;
  return originalFetch(resource, config);
};

document.addEventListener('DOMContentLoaded', () => {

  // Preloader
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => setTimeout(() => {
      preloader.classList.add('hidden');
      sessionStorage.setItem('lookupp_visited', 'true');
    }, 800));
    setTimeout(() => {
      preloader.classList.add('hidden');
      sessionStorage.setItem('lookupp_visited', 'true');
    }, 3000); // fallback
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
      // If href was changed dynamically and no longer starts with #, let it behave normally
      if (!id || !id.startsWith('#') || id === '#') return;
      
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
      const isProfilePage = window.location.pathname.includes('profile.html');
      const profilePic = user.profilePic 
        ? `<img src="${user.profilePic}" style="width:100%; height:100%; object-fit:cover;">` 
        : `<span>${firstName.charAt(0).toUpperCase()}</span>`;

      if (isProfilePage) {
        menuHTML.innerHTML = `
          <button class="nav-user-avatar" onclick="handleLogout()" title="Logout" style="background:transparent; border:none; color:var(--primary); cursor:pointer; padding:5px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; transition:0.3s;" onmouseover="this.style.background='rgba(227,30,36,0.1)'" onmouseout="this.style.background='transparent'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        `;
      } else {
        menuHTML.innerHTML = `
          <a href="profile.html" class="nav-user-avatar" title="My Profile">${profilePic}</a>
        `;
      }
      if (cta) {
        cta.insertBefore(menuHTML, cta.firstChild);
      } else {
        inner.appendChild(menuHTML);
      }
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


// DYNAMIC CONTENT SYNC
async function loadDynamicContent() {
  try {
    // 1. Testimonials
    const tContainer = document.querySelector('.testimonial-slider');
    if (tContainer) {
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        const testimonials = await res.json();
        if (testimonials && testimonials.length > 0) {
            const tHtml = testimonials.map(t => `
              <div class="glass-card testimonial-card">
                <div class="quote">"</div>
                <div class="stars">${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}</div>
                <p>${t.feedback}</p>
                <div class="testimonial-author">
                  <div class="testimonial-avatar">${t.client_name.charAt(0).toUpperCase()}</div>
                  <div class="testimonial-info">
                    <div class="name">${t.client_name}</div>
                    <div class="company">${t.company || 'Client'}</div>
                  </div>
                </div>
              </div>
            `).join('');
            tContainer.innerHTML = tHtml + tHtml;
        }
      }
    }

    // 2. Team
    const teamContainer = document.querySelector('.team-grid');
    if (teamContainer) {
      const res = await fetch('/api/team');
      if (res.ok) {
        const team = await res.json();
        if (team && team.length > 0) {
          teamContainer.innerHTML = team.map(member => `
            <div class="glass-card team-card">
              <div class="avatar" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">
                ${member.image ? `<img src="${member.image}" style="width:100%;height:100%;object-fit:cover;">` : '👤'}
              </div>
              <h3>${member.name}</h3>
              <div class="role">${member.role}</div>
              <p>${member.bio || ''}</p>
            </div>
          `).join('');
        }
      }
    }

    // 3. Projects
    const projectsContainer = document.querySelector('.portfolio-grid');
    if (projectsContainer) {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const projects = await res.json();
        if (projects && projects.length > 0) {
          projectsContainer.innerHTML = projects.map(p => `
            <div class="portfolio-card glass-card" data-category="${p.category || 'website'}" data-title="${p.title}">
              ${p.image ? `<img src="${p.image}" style="width:100%; height:200px; border-radius:12px 12px 0 0; object-fit:cover; margin:-24px -24px 20px -24px; max-width: none;">` : 
              `<div class="pc-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 4v10h16V8H4z"/></svg>
              </div>`}
              <div class="pc-content">
                <div class="pc-header"><span class="pc-tag">${p.category || 'Portfolio'}</span><span class="pc-client">${p.client || 'Client'}</span></div>
                <h3>${p.title}</h3>
                <p class="pc-desc">${p.description || ''}</p>
                <span class="view-btn">View Details →</span>
              </div>
            </div>
          `).join('');
        }
      }
    }

    // 4. Services
    const servicesContainer = document.querySelector('.services-grid'); // For index.html
    const sDigital = document.querySelector('#digital-marketing .services-detail-grid'); // For services.html
    const sBranding = document.querySelector('#creative-branding .services-detail-grid');
    const sDev = document.querySelector('#development .services-detail-grid');

    if (servicesContainer || sDigital || sBranding || sDev) {
      const res = await fetch('/api/services');
      if (res.ok) {
        const services = await res.json();
        if (services && services.length > 0) {
          
          // Populate index.html
          if (servicesContainer) {
            servicesContainer.innerHTML = services.map(s => `
              <div class="service-card glass-card">
                <div class="icon">${s.icon || '⚙️'}</div>
                <h3>${s.name}</h3>
                <p>${s.description || ''}</p>
                <a href="service-details.html?id=${s.id}" class="card-link">Learn More →</a>
              </div>
            `).join('');
          }
          
          // Populate services.html grids
          const generateServiceCard = (s) => `
            <div class="glass-card service-detail-card">
              <span class="icon">${s.icon || '⚙️'}</span>
              <h3>${s.name}</h3>
              <p>${s.description || ''}</p>
              <a href="service-details.html?id=${s.id}" class="learn-more">Get Started →</a>
            </div>
          `;
          
          if (sDigital) {
            sDigital.innerHTML = services.filter(s => s.category === 'digital-marketing').map(generateServiceCard).join('');
          }
          if (sBranding) {
            sBranding.innerHTML = services.filter(s => s.category === 'branding').map(generateServiceCard).join('');
          }
          if (sDev) {
            sDev.innerHTML = services.filter(s => s.category === 'development').map(generateServiceCard).join('');
          }
        }
      }
    }

  } catch(e) { console.error('Error loading dynamic content:', e); }
}

async function applyCMSContent() {
  try {
    const res = await fetch('/api/content?t=' + new Date().getTime());
    if (res.ok) {
      const content = await res.json();
      document.querySelectorAll('[data-cms]').forEach(el => {
        const path = el.getAttribute('data-cms').split('.');
        let val = content;
        for(let p of path) {
          if(val) val = val[p];
        }
        if(val !== undefined && val !== null && val !== '') {
          el.innerHTML = val;
        }
      });
      
      document.querySelectorAll('[data-cms-href]').forEach(el => {
        const path = el.getAttribute('data-cms-href').split('.');
        let val = content;
        for(let p of path) {
          if(val) val = val[p];
        }
        if(val !== undefined && val !== null && val !== '') {
          const prefix = el.getAttribute('data-cms-href-prefix') || '';
          el.setAttribute('href', prefix + val);
          el.style.display = ''; // reset display in case it was hidden
        } else if (el.closest('.contact-social') || el.closest('.footer-social')) {
          el.style.display = 'none'; // hide if no url
        }
      });
      
      document.querySelectorAll('[data-cms-src]').forEach(el => {
        const path = el.getAttribute('data-cms-src').split('.');
        let val = content;
        for(let p of path) {
          if(val) val = val[p];
        }
        if(val !== undefined && val !== null && val !== '') {
          el.setAttribute('src', val);
        }
      });
      
      // Load Trusted Brands
      const clientsRes = await fetch('/api/clients?t=' + new Date().getTime());
      if (clientsRes.ok) {
        const brands = await clientsRes.json();
        if (brands && brands.length > 0) {
          const scrollDiv = document.querySelector('.trusted-scroll');
          if (scrollDiv) {
            const brandsHtml = brands.map(b => `
              <span class="logo-item">
                ${b.logo_url ? `<img src="${b.logo_url}" alt="${b.name || 'Client logo'}" style="height: 90px; max-width: 240px; object-fit: contain;">` : b.name}
              </span>
            `).join('');
            scrollDiv.innerHTML = brandsHtml + brandsHtml;
          }
        }
      }
    }
  } catch(e) { console.error('Error applying CMS content:', e); }
}

async function applySettings() {
  try {
    const res = await fetch('/api/settings?t=' + new Date().getTime());
    if (res.ok) {
      const settings = await res.json();
      document.querySelectorAll('[data-setting]').forEach(el => {
        const key = el.getAttribute('data-setting');
        if (settings[key]) {
          el.innerHTML = settings[key];
        }
      });
      document.querySelectorAll('[data-setting-href]').forEach(el => {
        const key = el.getAttribute('data-setting-href');
        const prefix = el.getAttribute('data-setting-href-prefix') || '';
        if (settings[key]) {
          el.setAttribute('href', prefix + settings[key]);
        } else {
          el.style.display = 'none'; // hide social icon if no link provided
        }
      });
    }
  } catch(e) { console.error('Error applying settings:', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDynamicContent();
  applyCMSContent();
});
