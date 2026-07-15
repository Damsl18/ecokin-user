function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id');
}

function buildTimeline(s) {
  const items = [`<li><strong>Créé</strong><br><span class="article-card__meta">${formatDateTime(s.date_creation)}</span></li>`];

  if (s.statut === 'rejete') {
    items.push(`<li><strong>Rejeté</strong>${s.motif_rejet ? `<br><span class="article-card__meta">${escapeHtml(s.motif_rejet)}</span>` : ''}</li>`);
  } else if (s.date_validation) {
    items.push(`<li><strong>Validé</strong><br><span class="article-card__meta">${formatDateTime(s.date_validation)}</span></li>`);
    if (s.statut === 'en_cours') items.push(`<li><strong>En cours de traitement</strong></li>`);
    if (s.statut === 'traite') items.push(`<li><strong>Traité</strong></li>`);
  } else {
    items.push(`<li><strong>En attente de validation</strong></li>`);
  }

  return `<ul class="timeline">${items.join('')}</ul>`;
}

async function loadDetail() {
  const id = getIdFromQuery();
  const wrap = document.getElementById('detailContent');
  if (!id) { wrap.innerHTML = `<div class="empty-state">Signalement introuvable.</div>`; return; }

  try {
    const { signalement: s } = await apiGet(`/signalements/${id}`);

    wrap.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
        <h1 style="font-size:1.3rem;">${escapeHtml(s.titre || 'Signalement')}</h1>
        <span class="badge-statut badge-${s.statut}">${STATUT_LABELS_SIGNALEMENT[s.statut] || s.statut}</span>
      </div>
      <p>${escapeHtml(s.description)}</p>
      <p><i class="fa-solid fa-location-dot"></i> ${escapeHtml(s.adresse)}</p>
      ${s.photo_path ? `<img src="${photoUrl(s.photo_path)}" alt="" style="width:100%; border-radius:12px; margin-bottom:1rem;">` : ''}
      <div class="mini-map mb-3" id="map"></div>
      <h3 style="font-size:1rem;">Suivi</h3>
      ${buildTimeline(s)}
    `;

    const map = L.map('map', { zoomControl: false, dragging: false, scrollWheelZoom: false }).setView([s.latitude, s.longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    L.marker([s.latitude, s.longitude]).addTo(map);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAppShell();
  loadDetail();
});
