async function loadSignalements() {
  const tbody = document.getElementById('tableBody');
  const statut = document.getElementById('statutFilter').value;
  tbody.innerHTML = `<tr><td colspan="4"><div class="spinner" style="margin:1rem auto;"></div></td></tr>`;

  try {
    const params = statut ? `?statut=${statut}` : '';
    const { signalements } = await apiGet(`/signalements/me${params}`);

    if (!signalements.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">Aucun signalement pour ce filtre.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = signalements.map((s) => `
      <tr onclick="window.location.href='signalement-detail.html?id=${s.id}'" style="cursor:pointer;">
        <td data-label="Description">${escapeHtml((s.description || '').slice(0, 70))}${s.description.length > 70 ? '…' : ''}</td>
        <td data-label="Adresse">${escapeHtml(s.adresse)}</td>
        <td data-label="Date">${formatDate(s.date_creation)}</td>
        <td data-label="Statut"><span class="badge-statut badge-${s.statut}">${STATUT_LABELS_SIGNALEMENT[s.statut] || s.statut}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">${escapeHtml(err.message)}</div></td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAppShell();
  loadSignalements();
  document.getElementById('statutFilter').addEventListener('change', loadSignalements);
});
