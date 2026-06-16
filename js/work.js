/* ============ Work Page JavaScript ============ */
document.addEventListener('DOMContentLoaded', () => {
  // Filter buttons
  const filterBtns = document.querySelectorAll('.work-filter-btn');
  const items = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      items.forEach((item, i) => {
        const show = cat === 'all' || item.getAttribute('data-category') === cat;
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        setTimeout(() => {
          item.style.display = show ? 'block' : 'none';
          if (show) {
            setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; item.style.transition = 'all 0.4s ease'; }, i * 80);
          }
        }, 300);
      });
    });
  });

  // Modal
  const modal = document.querySelector('.project-modal');
  const modalContent = modal ? modal.querySelector('.modal-body') : null;

  document.querySelectorAll('.portfolio-card').forEach(item => {
    item.addEventListener('click', () => {
      if (!modal || !modalContent) return;
      const title = item.getAttribute('data-title') || 'Project';
      const desc = item.getAttribute('data-description') || 'Project details coming soon.';
      const category = item.getAttribute('data-category') || '';
      const client = item.getAttribute('data-client') || '';
      modalContent.innerHTML = `
        <h2>${title}</h2>
        <p class="modal-cat">${category.replace('-',' ').toUpperCase()}</p>
        <p>${desc}</p>
        ${client ? `<div class="client-info"><strong>Client:</strong> ${client}</div>` : ''}
      `;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (modal) {
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    });
  }
});
