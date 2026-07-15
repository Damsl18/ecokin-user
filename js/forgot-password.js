document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotForm');
  const msgBox = document.getElementById('formMsg');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi…';
    try {
      const data = await apiPost('/auth/forgot-password', {
        email: document.getElementById('email').value.trim(),
      });
      msgBox.className = 'text-success mb-2';
      msgBox.textContent = data.message;
      msgBox.style.display = 'block';
      form.reset();
    } catch (err) {
      msgBox.className = 'text-danger mb-2';
      msgBox.textContent = err.message;
      msgBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer le lien';
    }
  });
});
