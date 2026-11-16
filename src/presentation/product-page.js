import { ProductService } from '../application/product-service.js';
import { LocalStorageProductRepository } from '../infrastructure/local-storage-product-repository.js';
import { clear, element } from './dom.js';
import './floating-navigation.js';

const service = new ProductService(new LocalStorageProductRepository());
const form = document.getElementById('productForm');
const productList = document.getElementById('productList');
const catalogGrid = document.getElementById('catalogGrid');
const productCount = document.getElementById('productCount');
const saveButton = document.getElementById('saveProductBtn');
const cancelButton = document.getElementById('cancelEditBtn');
const imageInput = document.getElementById('imageUrl');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewText = document.getElementById('imagePreviewText');
let products = [];
let editingId = null;

function updateImagePreview(value) {
  const url = value.trim();
  if (!url) {
    imagePreview.removeAttribute('src');
    imagePreview.style.display = 'none';
    imagePreviewText.style.display = 'inline';
    return;
  }

  imagePreview.src = url;
  imagePreview.style.display = 'block';
  imagePreviewText.style.display = 'none';
}

function createProductCard(product) {
  const card = element('article', 'product-card');
  const image = product.image ? element('img', 'product-image') : element('div', 'product-image placeholder', 'Sin imagen');
  if (product.image) {
    image.src = product.image;
    image.alt = product.name;
  }

  const info = element('div', 'product-info');
  info.append(element('h3', '', product.name), element('p', '', product.category));
  const details = element('div', 'product-details');
  details.append(element('span', '', `$${product.price.toFixed(2)}`));
  details.append(element('span', '', `Stock: ${product.stock}`));

  const actions = element('div', 'product-actions');
  const edit = element('button', 'edit-btn', 'Editar');
  edit.type = 'button';
  edit.dataset.action = 'edit';
  edit.dataset.id = product.id;
  const remove = element('button', 'delete-btn', 'Eliminar');
  remove.type = 'button';
  remove.dataset.action = 'delete';
  remove.dataset.id = product.id;
  actions.append(edit, remove);
  card.append(image, info, details, actions);
  return card;
}

function renderProducts() {
  clear(productList);
  clear(catalogGrid);
  if (productCount) productCount.textContent = `${products.length} elemento${products.length === 1 ? '' : 's'}`;

  if (!products.length) {
    productList.append(element('div', 'empty-state', 'No hay productos aún. Agrega uno para comenzar.'));
    return;
  }

  products.forEach((product) => {
    productList.append(createProductCard(product));

    const card = element('article', 'store-card');
    const image = element('img');
    image.src = product.image || 'https://placehold.co/600x400/14171A/8A8F94?text=ScarTech';
    image.alt = product.name;
    const content = element('div', 'store-card-content');
    const top = element('div', 'store-card-top');
    top.append(element('span', 'store-category', product.category));
    top.append(element('span', 'store-stock', `Stock: ${product.stock}`));
    content.append(top, element('h3', '', product.name));
    content.append(element('p', '', 'Solución tecnológica pensada para crecer tu flujo creativo y profesional.'));
    const bottom = element('div', 'store-card-bottom');
    bottom.append(element('strong', '', `$${product.price.toFixed(2)}`));
    const buyButton = element('button', '', 'Comprar');
    buyButton.type = 'button';
    bottom.append(buyButton);
    content.append(bottom);
    card.append(image, content);
    catalogGrid.append(card);
  });
}

async function refreshProducts() {
  products = await service.list();
  renderProducts();
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Guardar producto';
  cancelButton.style.display = 'none';
  updateImagePreview('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    price: document.getElementById('price').value,
    stock: document.getElementById('stock').value,
    image: imageInput.value
  };

  try {
    if (editingId) await service.update(editingId, input);
    else await service.create(input);
    await refreshProducts();
    resetForm();
  } catch (error) {
    alert(error.message || 'No se pudo guardar el producto.');
  }
});

productList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;

  if (button.dataset.action === 'delete') {
    try {
      await service.remove(id);
      if (editingId === id) resetForm();
      await refreshProducts();
    } catch (error) {
      alert(error.message || 'No se pudo eliminar el producto.');
    }
    return;
  }

  const product = products.find((item) => item.id === id);
  if (!product) return;
  editingId = id;
  document.getElementById('name').value = product.name;
  document.getElementById('category').value = product.category;
  document.getElementById('price').value = product.price;
  document.getElementById('stock').value = product.stock;
  imageInput.value = product.image;
  updateImagePreview(product.image);
  saveButton.textContent = 'Actualizar producto';
  cancelButton.style.display = 'inline-flex';
  document.getElementById('name').focus();
});

imageInput.addEventListener('input', () => updateImagePreview(imageInput.value));
cancelButton.addEventListener('click', resetForm);
updateImagePreview('');
refreshProducts().catch((error) => {
  console.error('No se pudo cargar el catálogo.', error);
  productList.replaceChildren(element('div', 'empty-state', error.message));
});
