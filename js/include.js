/**
 * Charge les partiels header/bottom-nav, vérifie la session, affiche le prénom,
 * met en surbrillance l'onglet actif, et branche la déconnexion.
 * Nécessite d'être servi via un serveur HTTP (pas d'ouverture en file://).
 */
async function loadPartial(selector, url) {
  const host = document.querySelector(selector);
  if (!host) return;
  const res = await fetch(url);
  host.innerHTML = await res.text();
}

function highlightActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('[data-nav]').forEach((el) => {
    if (el.dataset.nav === page) el.classList.add('is-active');
  });
}

function wireLogout() {
  const handler = async () => {
    try {
      await apiPost('/auth/logout');
    } catch (err) {
      // même en cas d'erreur réseau, on renvoie vers le login
    }
    window.location.href = 'login.html';
  };
  document.getElementById('logoutBtn')?.addEventListener('click', handler);
  document.getElementById('logoutBtnMobile')?.addEventListener('click', handler);
}

function wireBurger() {
  const burger = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
  }
}

/**
 * À appeler en haut de chaque page protégée. Charge la coquille (header + bottom nav),
 * vérifie la session via /users/me, et retourne l'utilisateur connecté.
 */
async function initAppShell() {
  document.body.classList.add('app-shell');
  await Promise.all([
    loadPartial('#site-header', 'partials/header.html'),
    loadPartial('#bottom-nav-slot', 'partials/bottom-nav.html'),
  ]);
  highlightActiveNav();
  wireLogout();
  wireBurger();

  try {
    const { user } = await apiGet('/users/me');
    const greeting = document.getElementById('userGreeting');
    if (greeting) greeting.textContent = user.prenom;
    return user;
  } catch (err) {
    // apiGet redirige déjà vers login.html en cas de 401
    return null;
  }
}
