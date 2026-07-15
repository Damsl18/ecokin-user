document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Création…';

    try {
      await apiPost('/auth/register', {
        prenom: document.getElementById('prenom').value.trim(),
        nom: document.getElementById('nom').value.trim(),
        email: document.getElementById('email').value.trim(),
        commune: document.getElementById('commune').value.trim(),
        password: document.getElementById('password').value,
      });
      showToast('Compte créé ! Connecte-toi.', 'success');
      window.location.href = 'login.html';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Créer mon compte';
    }
  });
});
