function signalementRow(s) {
  return `
    <a class="article-card" href="signalement-detail.html?id=${s.id}" style="flex-direction:row; align-items:center; gap:1rem; padding:0.9rem 1.1rem;">
      <div style="flex:1;">
        <div style="font-weight:600;">${escapeHtml((s.description || '').slice(0, 60))}${s.description && s.description.length > 60 ? '…' : ''}</div>
        <div class="article-card__meta">${escapeHtml(s.adresse)} · ${formatDate(s.date_creation)}</div>
      </div>
      <span class="badge-statut badge-${s.statut}">${STATUT_LABELS_SIGNALEMENT[s.statut] || s.statut}</span>
    </a>
  `;
}

async function loadDashboard(user) {
  if (user) {
    document.getElementById('welcomeMsg').textContent = `Bonjour ${user.prenom} 👋`;
  }
  try {
    const { widgets, derniers_signalements } = await apiGet('/dashboard/user');

    document.getElementById('widgetsGrid').innerHTML = `
      <div class="widget"><div class="widget__icon"><i class="fa-solid fa-triangle-exclamation"></i></div><div class="widget__num">${widgets.nombre_signalements}</div><div class="widget__label">Mes signalements</div></div>
      <div class="widget"><div class="widget__icon"><i class="fa-solid fa-check"></i></div><div class="widget__num">${widgets.signalements_traites}</div><div class="widget__label">Traités</div></div>
      <div class="widget"><div class="widget__icon"><i class="fa-solid fa-newspaper"></i></div><div class="widget__num">${widgets.nombre_articles}</div><div class="widget__label">Mes articles</div></div>
      <div class="widget"><div class="widget__icon"><i class="fa-solid fa-circle-check"></i></div><div class="widget__num">${widgets.articles_publies}</div><div class="widget__label">Publiés</div></div>
    `;

    const list = document.getElementById('recentSignalements');
    if (!derniers_signalements.length) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-seedling" style="font-size:1.6rem; color:var(--c-green);"></i><p style="margin-top:0.8rem;">Aucun signalement pour l'instant. Le premier geste commence par un clic.</p></div>`;
    } else {
      list.innerHTML = `<div style="display:flex; flex-direction:column; gap:0.7rem;">${derniers_signalements.map(signalementRow).join('')}</div>`;
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await initAppShell();
  loadDashboard(user);
});
