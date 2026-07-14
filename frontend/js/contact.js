/* ============ Contact Page JavaScript ============ */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = {
      name: form.querySelector('[name="name"]').value,
      phone: form.querySelector('[name="phone"]').value,
      email: form.querySelector('[name="email"]').value,
      service: form.querySelector('[name="service"]').value,
      message: form.querySelector('[name="message"]').value,
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        showToast('Thank you! Your message has been sent. We will get back to you soon.', 'success');
        form.reset();
      } else {
        showToast('Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again later.', 'error');
    }

    btn.textContent = originalText;
    btn.disabled = false;
  });

  function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:100px;right:24px;z-index:10001;padding:16px 28px;border-radius:12px;color:#fff;font-weight:500;font-size:0.95rem;box-shadow:0 8px 32px rgba(0,0,0,0.3);animation:fadeInUp 0.5s ease;max-width:400px;`;
    toast.style.background = type === 'success' ? '#25d366' : '#e31e24';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 4000);
  }
});
