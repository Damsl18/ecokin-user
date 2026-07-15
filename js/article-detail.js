function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id');
}

async function loadArticle() {
  const id = getIdFromQuery();
  const wrap = document.getElementById('articleContent');
  if (!id) { wrap.innerHTML = `<div class="empty-state">Article introuvable.</div>`; return; }

  try {
    const { article } = await apiGet(`/articles/${id}`);
    wrap.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
        <h1 style="font-size:1.4rem;">${escapeHtml(article.titre)}</h1>
        <span class="badge-statut badge-${article.statut}">${STATUT_LABELS_ARTICLE[article.statut] || article.statut}</span>
      </div>
      ${article.cover_image_path ? `<img src="${photoUrl(article.cover_image_path)}" alt="" style="width:100%; border-radius:12px; margin-bottom:1rem;">` : ''}
      <div class="article-body">${article.contenu}</div>
      ${article.statut === 'en_attente' ? `<a href="articles-ecrire.html?id=${article.id}" class="btn btn-outline mt-3"><i class="fa-solid fa-pen"></i> Modifier</a>` : ''}
    `;
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAppShell();
  loadArticle();
});
