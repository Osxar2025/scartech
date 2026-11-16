import { IndexedDbMediaRepository } from '../infrastructure/indexed-db-media-repository.js';
import { MEDIA_TYPES } from '../domain/media-item.js';
import { clear, element } from './dom.js';

const repository = new IndexedDbMediaRepository();
const grid = document.getElementById('libraryGrid');
const emptyState = document.getElementById('emptyState');
let library = { music: [], image: [], video: [] };
let currentFilter = 'all';
let objectUrls = [];

function renderLibrary() {
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
      image.alt = item.title;
      media.append(image);
    } else {
      const video = element('video');
      video.src = item.url;
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

    card.append(media, content);
    grid.append(card);
  });
}

async function refreshLibrary() {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  library = await repository.list();
  objectUrls = Object.values(library).flat().map((item) => item.url);
  renderLibrary();
}

document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach((filter) => filter.classList.toggle('active', filter === button));
    renderLibrary();
  });
});

refreshLibrary().catch((error) => {
  console.error('No se pudo cargar la biblioteca.', error);
  emptyState.classList.remove('hidden');
  emptyState.querySelector('.empty-sub').textContent = error.message;
});
