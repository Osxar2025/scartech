import { MediaService } from '../application/media-service.js';
import { IndexedDbMediaRepository } from '../infrastructure/indexed-db-media-repository.js';
import { MEDIA_TYPES } from '../domain/media-item.js';
import { clear, element } from './dom.js';

const service = new MediaService(new IndexedDbMediaRepository());
const grid = document.getElementById('libraryGrid');
const emptyState = document.getElementById('emptyState');
let library = { music: [], image: [], video: [] };
let currentFilter = 'all';
let selectedFiles = { music: null, image: null, video: null };
let objectUrls = [];

function renderLibrary() {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls = [];
  clear(grid);
  const items = (currentFilter === 'all'
    ? MEDIA_TYPES.flatMap((type) => library[type])
    : library[currentFilter]).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  emptyState.classList.toggle('hidden', items.length > 0);
  items.forEach((item) => {
    const card = element('article', 'library-item');
    const media = element('div', item.type === 'music'
      ? 'library-item-media library-item-audio'
      : 'library-item-media');
    if (item.type === 'music') {
      media.append(element('div', '', '♪'));
      media.firstElementChild.style.fontSize = '48px';
    } else if (item.type === 'image') {
      const image = element('img');
      image.src = item.url;
      objectUrls.push(item.url);
      image.alt = item.title;
      media.append(image);
    } else {
      const video = element('video');
      video.src = item.url;
      objectUrls.push(item.url);
      video.controls = true;
      media.append(video);
    }

    const content = element('div', 'library-item-content');
    content.append(element('div', 'library-item-title', item.title));
    if (item.type === 'music') {
      content.append(element('div', 'library-item-subtitle', item.artist || 'Artista desconocido'));
    } else if (item.description) {
      content.append(element('div', 'library-item-description', item.description));
    }
    content.append(element('div', 'library-item-subtitle', `${item.size} MB`));

    const actions = element('div', 'library-item-actions');
    const download = element('a', 'library-item-btn', '⬇️ Descargar');
    download.href = item.url;
    if (item.url.startsWith('blob:')) objectUrls.push(item.url);
    download.download = item.fileName || item.title;
    const remove = element('button', 'library-item-btn', '🗑️ Eliminar');
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.dataset.id = item.id;
    actions.append(download, remove);
    content.append(actions);
    card.append(media, content);
    grid.append(card);
  });
}

async function refreshLibrary() {
  library = await service.list();
  renderLibrary();
}

function selectUploadTab(type, button) {
  document.querySelectorAll('.upload-tab-btn').forEach((tab) => tab.classList.toggle('active', tab === button));
  document.querySelectorAll('.upload-section').forEach((section) => section.classList.toggle('active', section.id === `${type}-section`));
}

function getUploadInput(type) {
  if (type === 'music') {
    return {
      title: document.getElementById('musicTitle').value,
      artist: document.getElementById('musicArtist').value,
      file: selectedFiles.music
    };
  }
  const prefix = type === 'image' ? 'image' : 'video';
  return {
    title: document.getElementById(`${prefix}Title`).value,
    description: document.getElementById(`${prefix}Description`).value,
    file: selectedFiles[type]
  };
}

function clearUploadForm(type) {
  const prefix = type === 'music' ? 'music' : type;
  document.getElementById(`${prefix}Title`).value = '';
  document.getElementById(`${prefix}${type === 'music' ? 'Artist' : 'Description'}`).value = '';
  document.getElementById(`${prefix}Input`).value = '';
  selectedFiles[type] = null;
}

async function addMedia(type) {
  const input = getUploadInput(type);
  try {
    if (!input.title.trim()) throw new Error('Ingresa un título para el archivo.');
    const limits = { music: 50, image: 10, video: 100 };
    if (!input.file) throw new Error('Selecciona un archivo multimedia.');
    if (input.file.size > limits[type] * 1024 * 1024) throw new Error(`El archivo supera el límite de ${limits[type]} MB.`);
    await service.add({ type, ...input }, input.file);
    await refreshLibrary();
    clearUploadForm(type);
  } catch (error) {
    alert(error.message || 'No se pudo guardar el archivo.');
  }
}

document.querySelectorAll('.upload-tab-btn').forEach((button) => {
  button.addEventListener('click', () => selectUploadTab(button.dataset.type, button));
});

MEDIA_TYPES.forEach((type) => {
  const input = document.getElementById(`${type}Input`);
  input.addEventListener('change', () => {
    selectedFiles[type] = input.files[0] ?? null;
  });
  document.getElementById(`add${type[0].toUpperCase()}${type.slice(1)}Btn`)
    .addEventListener('click', () => addMedia(type));
});

document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach((filter) => filter.classList.toggle('active', filter === button));
    renderLibrary();
  });
});

grid.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action="delete"]');
  if (!button) return;
  try {
    await service.remove(button.dataset.id);
    await refreshLibrary();
  } catch (error) {
    alert(error.message || 'No se pudo eliminar el archivo multimedia.');
  }
});

refreshLibrary().catch((error) => {
  console.error('No se pudo cargar la biblioteca.', error);
  emptyState.classList.remove('hidden');
  emptyState.querySelector('.empty-sub').textContent = error.message;
});
