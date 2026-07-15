document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backToPublic').href = CONFIG.PUBLIC_APP_URL;

  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion…';

    try {
      await apiPost('/auth/login', {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      });

      const params = new URLSearchParams(window.location.search);
      if (params.get('intent') === 'article') {
        window.location.href = 'articles-ecrire.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
    }
  });
});
