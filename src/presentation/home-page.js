import { HomeContentService } from '../application/home-content-service.js';
import { IndexedDbMediaRepository } from '../infrastructure/indexed-db-media-repository.js';
import { LocalStorageProductRepository } from '../infrastructure/local-storage-product-repository.js';
import { element } from './dom.js';

const contentService = new HomeContentService(
  new LocalStorageProductRepository(),
  new IndexedDbMediaRepository()
);

function renderProducts(products) {
  const grid = document.getElementById('homeFeaturedProducts');
  if (!grid) return;

  grid.replaceChildren();
  if (!products.length) {
    grid.append(element('p', 'empty-state', 'Pronto encontrarás aquí los productos destacados.'));
    return;
  }
  products.slice(0, 3).forEach((product) => {
    const card = element('article', 'product-showcase');
    const image = element('img');
    image.src = product.image || 'https://placehold.co/600x400/14171A/8A8F94?text=ScarTech';
    image.alt = product.name;

    const content = element('div', 'product-showcase-content');
    content.append(element('span', '', product.category));
    content.append(element('h3', '', product.name));

    const details = element('div');
    const price = element('strong', '', `$${Number(product.price).toFixed(2)}`);
    const stock = element('small', '', `Stock ${product.stock}`);
    details.append(price, stock);
    content.append(details);
    card.append(image, content);
    grid.append(card);
  });
}

function renderMedia(media) {
  const grid = document.getElementById('homeMediaGrid');
  if (!grid) return;

  grid.replaceChildren();
  const items = [...media.music, ...media.image, ...media.video].slice(0, 4);
  if (!items.length) {
    grid.append(element('p', 'empty-state', 'Pronto encontrarás aquí nuevas publicaciones audiovisuales.'));
    return;
  }
  items.forEach((item) => {
    const card = element('article', 'media-showcase');
    if (item.type === 'image') {
      const thumbnail = element('div', 'media-thumb');
      const image = element('img');
      image.src = item.url;
      image.alt = item.title;
      thumbnail.append(image);
      card.append(thumbnail);
    } else {
      card.append(element('div', 'media-icon', item.type === 'music' ? '♪' : '▶'));
    }

    const details = element('div');
    details.append(element('h3', '', item.title));
    details.append(element('p', '', item.type === 'music'
      ? item.artist || 'Artista'
      : item.description || (item.type === 'video' ? 'Video destacado' : 'Imagen destacada')));
    card.append(details);
    grid.append(card);
  });
}

async function initializeHomePage() {
  try {
    const content = await contentService.getFeaturedContent();
    renderProducts(content.products);
    renderMedia(content.media);
  } catch (error) {
    console.error('No se pudo cargar el contenido de la tienda.', error);
    const grids = ['homeFeaturedProducts', 'homeMediaGrid']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    grids.forEach((grid) => grid.replaceChildren(element('p', 'empty-state', 'No se pudo cargar el contenido.')));
  }
}

initializeHomePage();
