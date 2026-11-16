import { LocalStorageProductRepository } from '../infrastructure/local-storage-product-repository.js';
import { element } from './dom.js';

const grid = document.getElementById('catalogGrid');
const count = document.getElementById('productCount');
const repository = new LocalStorageProductRepository();

function render(products) {
  grid.replaceChildren();
  count.textContent = `${products.length} elemento${products.length === 1 ? '' : 's'}`;

  if (!products.length) {
    grid.append(element('div', 'empty-state', 'Pronto encontrarás aquí los productos de la tienda.'));
    return;
  }

  products.forEach((product) => {
    const card = element('article', 'store-card');
    const image = element('img');
    image.src = product.image || 'https://placehold.co/600x400/14171A/8A8F94?text=ScarTech';
    image.alt = product.name;
    const content = element('div', 'store-card-content');
    const top = element('div', 'store-card-top');
    top.append(element('span', 'store-category', product.category));
    top.append(element('span', 'store-stock', `Stock: ${product.stock}`));
    content.append(top, element('h3', '', product.name));
    content.append(element('p', '', product.description || 'Solución tecnológica pensada para crecer tu flujo creativo y profesional.'));
    const bottom = element('div', 'store-card-bottom');
    bottom.append(element('strong', '', `$${product.price.toFixed(2)}`));
    content.append(bottom);
    card.append(image, content);
    grid.append(card);
  });
}

try {
  render(repository.list());
} catch (error) {
  console.error('No se pudo cargar el catálogo de productos.', error);
  grid.replaceChildren(element('div', 'empty-state', error.message));
}
