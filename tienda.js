const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const productCount = document.getElementById('productCount');
const catalogGrid = document.getElementById('catalogGrid');
const saveProductBtn = document.getElementById('saveProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const productName = document.getElementById('name');
const productCategory = document.getElementById('category');
const productPrice = document.getElementById('price');
const productStock = document.getElementById('stock');
const productImageUrl = document.getElementById('imageUrl');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewText = document.getElementById('imagePreviewText');

let products = [];
let editingId = null;

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Error al cargar productos');
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error(error);
    products = [];
    renderProducts();
  }
}

async function saveProducts() {
  return true;
}

function updateImagePreview(url) {
  const cleanUrl = (url || '').trim();

  if (!cleanUrl) {
    imagePreview.removeAttribute('src');
    imagePreview.style.display = 'none';
    imagePreviewText.style.display = 'inline';
    return;
  }

  imagePreview.src = cleanUrl;
  imagePreview.style.display = 'block';
  imagePreviewText.style.display = 'none';
}

function renderProducts() {
  if (productList) {
    productList.innerHTML = '';

    if (products.length === 0) {
      productList.innerHTML = '<div class="empty-state">No hay productos aún. Agrega uno para comenzar.</div>';
      if (productCount) productCount.textContent = '0 elementos';
      return;
    }

    products.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'product-card';

      const imageMarkup = product.image
        ? `<img class="product-image" src="${product.image}" alt="${product.name}">`
        : '<div class="product-image placeholder">Sin imagen</div>';

      card.innerHTML = `
        ${imageMarkup}
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.category}</p>
        </div>
        <div class="product-details">
          <span>$${Number(product.price).toFixed(2)}</span>
          <span>Stock: ${product.stock}</span>
        </div>
        <div class="product-actions">
          <button class="edit-btn" data-id="${product.id}">Editar</button>
          <button class="delete-btn" data-id="${product.id}">Eliminar</button>
        </div>
      `;

      productList.appendChild(card);
    });

    if (productCount) productCount.textContent = `${products.length} elemento${products.length === 1 ? '' : 's'}`;
  }

  if (catalogGrid) {
    catalogGrid.innerHTML = products
      .map((product) => `
        <article class="store-card">
          <img src="${product.image || 'https://placehold.co/600x400/14171A/8A8F94?text=ScarTech'}" alt="${product.name}">
          <div class="store-card-content">
            <div class="store-card-top">
              <span class="store-category">${product.category}</span>
              <span class="store-stock">Stock: ${product.stock}</span>
            </div>
            <h3>${product.name}</h3>
            <p>Solución tecnológica pensada para crecer tu flujo creativo y profesional.</p>
            <div class="store-card-bottom">
              <strong>$${Number(product.price).toFixed(2)}</strong>
              <button type="button">Comprar</button>
            </div>
          </div>
        </article>
      `)
      .join('');
  }
}

function resetForm() {
  productForm.reset();
  editingId = null;
  saveProductBtn.textContent = 'Guardar producto';
  cancelEditBtn.style.display = 'none';
  updateImagePreview('');
}

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: productName.value.trim(),
    category: productCategory.value.trim(),
    price: Number(productPrice.value),
    stock: Number(productStock.value),
    image: productImageUrl.value.trim(),
    description: ''
  };

  if (!payload.name || !payload.category || payload.price < 0 || payload.stock < 0) {
    alert('Completa los campos correctamente.');
    return;
  }

  try {
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'No se pudo guardar el producto');
    }

    await loadProducts();
    resetForm();
  } catch (error) {
    alert(error.message || 'Error al guardar el producto');
  }
});

productList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.classList.contains('delete-btn')) {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('No se pudo eliminar el producto');
      await loadProducts();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      alert(error.message || 'Error al eliminar el producto');
    }
    return;
  }

  if (button.classList.contains('edit-btn')) {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    editingId = id;
    productName.value = product.name;
    productCategory.value = product.category;
    productPrice.value = product.price;
    productStock.value = product.stock;
    productImageUrl.value = product.image || '';
    updateImagePreview(product.image || '');

    saveProductBtn.textContent = 'Actualizar producto';
    cancelEditBtn.style.display = 'inline-flex';
    productName.focus();
  }
});

productImageUrl.addEventListener('input', (event) => {
  updateImagePreview(event.target.value);
});

cancelEditBtn.addEventListener('click', resetForm);

updateImagePreview('');
loadProducts();
