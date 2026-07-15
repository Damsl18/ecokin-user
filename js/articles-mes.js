async function deleteArticle(id) {
  if (!confirmAction('Supprimer définitivement cet article ?')) return;
  try {
    await apiDelete(`/articles/${id}`);
    showToast('Article supprimé.', 'success');
    loadArticles();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadArticles() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = `<tr><td colspan="4"><div class="spinner" style="margin:1rem auto;"></div></td></tr>`;
  try {
    const { articles } = await apiGet('/articles/me');
    if (!articles.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-pen" style="font-size:1.4rem; color:var(--c-green);"></i><p class="mt-2 mb-0">Tu n'as encore rien publié. <a href="articles-ecrire.html">Écrire un article</a></p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = articles.map((a) => `
      <tr>
        <td data-label="Titre">${escapeHtml(a.titre)}</td>
        <td data-label="Date">${formatDate(a.date_creation)}</td>
        <td data-label="Statut"><span class="badge-statut badge-${a.statut}">${STATUT_LABELS_ARTICLE[a.statut] || a.statut}</span></td>
        <td data-label="Actions">
          <div class="d-flex gap-2 flex-wrap">
            <a class="btn btn-outline btn-sm" href="article-detail.html?id=${a.id}">Voir</a>
            ${a.statut === 'en_attente' ? `<a class="btn btn-outline btn-sm" href="articles-ecrire.html?id=${a.id}">Modifier</a>` : ''}
            ${a.statut === 'en_attente' ? `<button class="btn btn-outline btn-sm text-danger" onclick="deleteArticle(${a.id})">Supprimer</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">${escapeHtml(err.message)}</div></td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAppShell();
  loadArticles();
});
