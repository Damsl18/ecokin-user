const KINSHASA_CENTER = [-4.325, 15.322];
let selectedLatLng = null;
let marker = null;
let selectedFile = null;

function initMap() {
  const map = L.map('map').setView(KINSHASA_CENTER, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  map.on('click', (e) => {
    selectedLatLng = e.latlng;
    if (marker) marker.remove();
    marker = L.marker(e.latlng).addTo(map);
    document.getElementById('coordsText').textContent =
      `Position choisie : ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  });
}

function wireUpload() {
  const input = document.getElementById('photoInput');
  const drop = document.getElementById('uploadDrop');
  const preview = document.getElementById('uploadPreview');
  const placeholder = document.getElementById('uploadPlaceholder');

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image trop lourde (5 Mo max).', 'error');
      input.value = '';
      return;
    }
    selectedFile = file;
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    drop.classList.add('has-image');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAppShell();
  initMap();
  wireUpload();

  const form = document.getElementById('signalementForm');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    if (!selectedLatLng) {
      errorBox.textContent = 'Merci de sélectionner une position sur la carte.';
      errorBox.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi…';

    const formData = new FormData();
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('adresse', document.getElementById('adresse').value.trim());
    formData.append('latitude', selectedLatLng.lat);
    formData.append('longitude', selectedLatLng.lng);
    if (selectedFile) formData.append('photo', selectedFile);

    try {
      await apiPost('/signalements', formData, true);
      showToast('Signalement envoyé avec succès.', 'success');
      window.location.href = 'signalements-mes.html';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer le signalement';
    }
  });
});
