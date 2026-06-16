/* Feedback Page JavaScript */
document.addEventListener('DOMContentLoaded', () => {
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  let selectedRating = 0;

  // Star Rating
  const stars = document.querySelectorAll('#star-rating .star');
  const ratingText = document.getElementById('rating-text');

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.getAttribute('data-value'));
      highlightStars(val);
    });
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      highlightStars(selectedRating);
      if (ratingText) ratingText.textContent = ratingLabels[selectedRating];
    });
  });

  const starContainer = document.getElementById('star-rating');
  if (starContainer) {
    starContainer.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
    });
  }

  function highlightStars(count) {
    stars.forEach((s, i) => {
      if (i < count) s.classList.add('active');
      else s.classList.remove('active');
    });
  }

  // Pre-fill from login
  const userData = localStorage.getItem('lookupp_user');
  if (userData) {
    const user = JSON.parse(userData);
    const nameField = document.getElementById('fb-name');
    const emailField = document.getElementById('fb-email');
    if (nameField && user.name) nameField.value = user.name;
    if (emailField && user.email) emailField.value = user.email;
  }

  // Form submission
  const form = document.getElementById('feedback-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (selectedRating === 0) {
        if (typeof showToast === 'function') showToast('error', '⚠️', 'Please select a rating.');
        return;
      }
      const data = {
        name: document.getElementById('fb-name').value,
        email: document.getElementById('fb-email').value,
        service: document.getElementById('fb-service').value,
        rating: selectedRating,
        message: document.getElementById('fb-message').value
      };
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) { /* Server may not be running */ }

      form.style.display = 'none';
      document.querySelector('.feedback-form-wrap > h2').style.display = 'none';
      document.querySelector('.feedback-form-wrap > p').style.display = 'none';
      document.getElementById('feedback-success').classList.add('show');
      if (typeof showToast === 'function') showToast('success', '🎉', 'Feedback submitted! Thank you.');
    });
  }
});

function resetFeedbackForm() {
  const form = document.getElementById('feedback-form');
  if (form) {
    form.reset();
    form.style.display = '';
    document.querySelector('.feedback-form-wrap > h2').style.display = '';
    document.querySelector('.feedback-form-wrap > p').style.display = '';
    document.getElementById('feedback-success').classList.remove('show');
    document.querySelectorAll('#star-rating .star').forEach(s => s.classList.remove('active'));
    document.getElementById('rating-text').textContent = '';
  }
}
