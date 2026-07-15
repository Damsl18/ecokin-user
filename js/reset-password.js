document.addEventListener('DOMContentLoaded', () => {
  const token = new URLSearchParams(window.location.search).get('token');
  const form = document.getElementById('resetForm');
  const msgBox = document.getElementById('formMsg');
  const submitBtn = document.getElementById('submitBtn');

  if (!token) {
    document.getElementById('introText').textContent = 'Lien invalide : le token est manquant. Redemande un lien depuis la page "mot de passe oublié".';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Réinitialisation…';
    try {
      const data = await apiPost('/auth/reset-password', {
        token,
        newPassword: document.getElementById('newPassword').value,
      });
      msgBox.className = 'text-success mb-2';
      msgBox.textContent = data.message;
      msgBox.style.display = 'block';
      form.reset();
      setTimeout(() => { window.location.href = 'login.html'; }, 1800);
    } catch (err) {
      msgBox.className = 'text-danger mb-2';
      msgBox.textContent = err.message;
      msgBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Réinitialiser';
    }
  });
});
