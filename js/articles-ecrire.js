let editingId = null;
let selectedFile = null;

function wrapSelection(textarea, before, after) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || 'texte';
  textarea.value = value.slice(0, start) + before + selected + after + value.slice(end);
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + selected.length;
}

function wireEditorToolbar() {
  const textarea = document.getElementById('contenu');
  document.getElementById('boldBtn').addEventListener('click', () => wrapSelection(textarea, '<strong>', '</strong>'));
  document.getElementById('italicBtn').addEventListener('click', () => wrapSelection(textarea, '<em>', '</em>'));
}

function wireUpload() {
  const input = document.getElementById('coverInput');
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

async function loadForEdit(id) {
  try {
    const { article } = await apiGet(`/articles/${id}`);
    if (article.statut !== 'en_attente') {
      showToast('Seuls les articles en attente peuvent être modifiés.', 'error');
      window.location.href = 'articles-mes.html';
      return;
    }
    document.getElementById('pageTitle').textContent = 'Modifier mon article';
    document.getElementById('submitBtn').textContent = 'Enregistrer les modifications';
    document.getElementById('titre').value = article.titre;
    document.getElementById('contenu').value = article.contenu;
    if (article.cover_image_path) {
      const preview = document.getElementById('uploadPreview');
      preview.src = photoUrl(article.cover_image_path);
      preview.style.display = 'block';
      document.getElementById('uploadPlaceholder').style.display = 'none';
      document.getElementById('uploadDrop').classList.add('has-image');
    }
  } catch (err) {
    showToast(err.message, 'error');
    window.location.href = 'articles-mes.html';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAppShell();
  wireEditorToolbar();
  wireUpload();

  editingId = new URLSearchParams(window.location.search).get('id');
  if (editingId) await loadForEdit(editingId);

  const form = document.getElementById('articleForm');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi…';

    const formData = new FormData();
    formData.append('titre', document.getElementById('titre').value.trim());
    formData.append('contenu', document.getElementById('contenu').value.trim());
    if (selectedFile) formData.append('cover_image', selectedFile);

    try {
      if (editingId) {
        await apiPut(`/articles/${editingId}`, formData, true);
        showToast('Article mis à jour.', 'success');
      } else {
        await apiPost('/articles', formData, true);
        showToast('Article soumis pour validation.', 'success');
      }
      window.location.href = 'articles-mes.html';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? 'Enregistrer les modifications' : 'Soumettre pour validation';
    }
  });
});
