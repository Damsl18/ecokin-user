document.addEventListener('DOMContentLoaded', async () => {
  const user = await initAppShell();
  if (user) {
    document.getElementById('prenom').value = user.prenom;
    document.getElementById('nom').value = user.nom;
    document.getElementById('email').value = user.email;
    document.getElementById('commune').value = user.commune;
  }

  document.getElementById('logoutBtnProfile').addEventListener('click', () => {
    document.getElementById('logoutBtn')?.click();
  });

  const profileForm = document.getElementById('profileForm');
  const profileMsg = document.getElementById('profileMsg');
  const profileBtn = document.getElementById('profileBtn');

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    profileBtn.disabled = true;
    profileMsg.style.display = 'none';
    try {
      await apiPut('/users/me', {
        prenom: document.getElementById('prenom').value.trim(),
        nom: document.getElementById('nom').value.trim(),
        email: document.getElementById('email').value.trim(), // inchangé, requis par l'API
        commune: document.getElementById('commune').value.trim(),
      });
      profileMsg.className = 'text-success mb-2';
      profileMsg.textContent = 'Profil mis à jour.';
      profileMsg.style.display = 'block';
      showToast('Profil mis à jour.', 'success');
    } catch (err) {
      profileMsg.className = 'text-danger mb-2';
      profileMsg.textContent = err.message;
      profileMsg.style.display = 'block';
    } finally {
      profileBtn.disabled = false;
    }
  });

  const passwordForm = document.getElementById('passwordForm');
  const passwordMsg = document.getElementById('passwordMsg');
  const passwordBtn = document.getElementById('passwordBtn');

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    passwordBtn.disabled = true;
    passwordMsg.style.display = 'none';
    try {
      const data = await apiPut('/users/me/password', {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value,
      });
      passwordMsg.className = 'text-success mb-2';
      passwordMsg.textContent = data.message;
      passwordMsg.style.display = 'block';
      passwordForm.reset();
    } catch (err) {
      passwordMsg.className = 'text-danger mb-2';
      passwordMsg.textContent = err.message;
      passwordMsg.style.display = 'block';
    } finally {
      passwordBtn.disabled = false;
    }
  });
});
