const KINSHASA_CENTER = [-4.325, 15.322];
let map;
let readIds = new Set();

function statutColor(statut) {
  if (statut === 'traite') return '#4CAF50';
  if (statut === 'en_attente') return '#E8A33D';
  return '#2D6CDF'; // valide / en_cours
}

function readBadgeHtml(id) {
  const isRead = readIds.has(id);
  return `<span class="read-badge ${isRead ? 'is-read' : ''}" id="readBadge-${id}">${isRead ? '✓ Lu' : 'Non lu'}</span>`;
}

function markReadButtonHtml(id) {
  if (readIds.has(id)) return '';
  return `<button class="btn btn-outline btn-sm mt-2" onclick="markSignalementRead(${id})" id="readBtn-${id}">Marquer comme lu</button>`;
}

async function markSignalementRead(id) {
  try {
    await apiPost(`/signalements/${id}/lu`);
    readIds.add(id);
    const badge = document.getElementById(`readBadge-${id}`);
    if (badge) { badge.textContent = '✓ Lu'; badge.classList.add('is-read'); }
    document.getElementById(`readBtn-${id}`)?.remove();
    showToast('Marqué comme lu.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function popupSignalement(s, isOwn) {
  return `
    <strong>${escapeHtml(s.titre || 'Signalement')}</strong><br>
    <span class="badge-statut badge-${s.statut || ''}">${STATUT_LABELS_SIGNALEMENT[s.statut] || s.statut || 'Validé'}</span>
    ${isOwn ? ' <em>(le mien)</em>' : ''}<br>
    <small>${escapeHtml(s.adresse)}</small><br>
    ${s.photo_path ? `<img src="${photoUrl(s.photo_path)}" alt="" style="width:100%; border-radius:8px; margin:6px 0;">` : ''}
    <div class="mt-1">${readBadgeHtml(s.id)}</div>
    ${markReadButtonHtml(s.id)}
  `;
}

function popupPoint(p) {
  return `<strong>${escapeHtml(p.nom)}</strong><br><small>${escapeHtml(p.adresse)}</small>${p.type_dechet ? `<br>Type : ${escapeHtml(p.type_dechet)}` : ''}`;
}

async function loadMap() {
  const markersLayer = L.layerGroup().addTo(map);

  try {
    const [mapData, mine, lues] = await Promise.all([
      apiGet('/map/data'),
      apiGet('/signalements/me?statut=en_attente'),
      apiGet('/signalements/lues'),
    ]);

    readIds = new Set(lues.signalement_ids);

    mapData.signalements.forEach((s) => {
      L.circleMarker([s.latitude, s.longitude], {
        radius: 8, color: statutColor(s.statut), fillColor: statutColor(s.statut), fillOpacity: 0.85, weight: 2,
      }).bindPopup(popupSignalement(s, false)).addTo(markersLayer);
    });

    mapData.points_collection.forEach((p) => {
      L.marker([p.latitude, p.longitude], {
        icon: L.divIcon({ className: '', html: '<i class="fa-solid fa-recycle" style="color:#2E7D32; font-size:20px;"></i>', iconSize: [20, 20] }),
      }).bindPopup(popupPoint(p)).addTo(markersLayer);
    });

    mapData.zones_risque.forEach((z) => {
      L.circle([z.latitude, z.longitude], {
        radius: z.rayon_m, color: '#C0392B', fillColor: '#C0392B', fillOpacity: 0.15, weight: 1.5,
      }).bindPopup(`<strong>${escapeHtml(z.nom)}</strong><br>Niveau : ${escapeHtml(z.niveau_risque)}`).addTo(markersLayer);
    });

    mine.signalements.forEach((s) => {
      L.circleMarker([s.latitude, s.longitude], {
        radius: 8, color: statutColor('en_attente'), fillColor: statutColor('en_attente'), fillOpacity: 0.9, weight: 2, dashArray: '4',
      }).bindPopup(popupSignalement(s, true)).addTo(markersLayer);
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAppShell();
  map = L.map('map').setView(KINSHASA_CENTER, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  loadMap();
});
