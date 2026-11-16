import { AdminAuthService } from '../application/admin-auth-service.js';
import { MediaService } from '../application/media-service.js';
import { ProductService } from '../application/product-service.js';
import { BLOG_SECTION_LABELS, LocalStorageBlogRepository, LocalStorageConverterInfoRepository } from '../infrastructure/local-storage-admin-repositories.js';
import { BrowserPasswordHasher } from '../infrastructure/browser-password-hasher.js';
import { IndexedDbMediaRepository } from '../infrastructure/indexed-db-media-repository.js';
import { LocalStorageProductRepository } from '../infrastructure/local-storage-product-repository.js';
import { element } from './dom.js';

const auth = new AdminAuthService(window.localStorage, new BrowserPasswordHasher());
const productService = new ProductService(new LocalStorageProductRepository());
const blogRepository = new LocalStorageBlogRepository();
const converterRepository = new LocalStorageConverterInfoRepository();
const authPanel = document.getElementById('adminAuthPanel');
const dashboard = document.getElementById('adminDashboard');
const setupForm = document.getElementById('adminSetupForm');
const loginForm = document.getElementById('adminLoginForm');
const feedback = document.getElementById('authFeedback');
const loadButton = document.getElementById('adminLoadButton');
let mediaObjectUrls = [];
let dashboardInitialized = false;

function showAuthError(message) {
  feedback.textContent = message;
  feedback.hidden = false;
}

function prepareAuthScreen() {
  document.getElementById('authTitle').innerHTML = auth.isConfigured()
    ? 'Administrador <span>ScarTech</span>'
    : 'Configura tu <span>acceso</span>';
  setupForm.hidden = auth.isConfigured();
  loginForm.hidden = !auth.isConfigured();
  authPanel.hidden = false;
  dashboard.hidden = true;
  loadButton.hidden = true;
}

function activateSection(section) {
  const requested = ['products', 'media', 'blog', 'converter'].includes(section) ? section : 'products';
  const formAnchors = {
    products: 'adminProductForm',
    media: 'adminMediaForm',
    blog: 'adminBlogForm',
    converter: 'adminConverterForm'
  };
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    const active = tab.dataset.adminSection === requested;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.admin-section-panel').forEach((panel) => {
    panel.hidden = panel.dataset.section !== requested;
  });
  location.hash = requested;
  loadButton.href = `#${formAnchors[requested]}`;
}

function recordRow(title, description, actions) {
  const row = element('article', 'admin-record');
  const info = element('div', 'admin-record-info');
  info.append(element('h3', '', title));
  if (description) info.append(element('p', '', description));
  row.append(info, actions);
  return row;
}

function actionButton(label, action, id, className = 'edit-btn') {
  const button = element('button', className, label);
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function initializeProductAdmin() {
  const form = document.getElementById('adminProductForm');
  const list = document.getElementById('adminProductList');
  const count = document.getElementById('adminProductCount');

  function reset() {
    form.reset();
    document.getElementById('adminProductId').value = '';
    document.getElementById('adminProductSave').textContent = 'Guardar producto';
  }
  document.querySelector('[data-reset-form="adminProductForm"]').addEventListener('click', reset);

  function render(products) {
    list.replaceChildren();
    count.textContent = `${products.length} producto${products.length === 1 ? '' : 's'}`;
    if (!products.length) {
      list.append(element('div', 'empty-state', 'Todavía no hay productos. Usa el formulario para agregar el primero.'));
      return;
    }

    products.forEach((product) => {
      const actions = element('div', 'admin-record-actions');
      actions.append(actionButton('Editar', 'edit-product', product.id));
      actions.append(actionButton('Eliminar', 'delete-product', product.id, 'delete-btn'));
      list.append(recordRow(product.name, `${product.category} · $${product.price.toFixed(2)} · Stock ${product.stock}`, actions));
    });
  }

  async function refresh() {
    render(await productService.list());
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('adminProductId').value;
    const data = {
      name: document.getElementById('adminProductName').value,
      category: document.getElementById('adminProductCategory').value,
      price: document.getElementById('adminProductPrice').value,
      stock: document.getElementById('adminProductStock').value,
      image: document.getElementById('adminProductImage').value,
      description: document.getElementById('adminProductDescription').value
    };
    try {
      if (id) await productService.update(id, data);
      else await productService.create(data);
      reset();
      await refresh();
    } catch (error) {
      alert(error.message || 'No se pudo guardar el producto.');
    }
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const products = await productService.list();
    const product = products.find((item) => item.id === button.dataset.id);
    if (!product) return;

    try {
      if (button.dataset.action === 'delete-product') {
        await productService.remove(product.id);
        if (document.getElementById('adminProductId').value === product.id) reset();
        await refresh();
      } else {
        document.getElementById('adminProductId').value = product.id;
        document.getElementById('adminProductName').value = product.name;
        document.getElementById('adminProductCategory').value = product.category;
        document.getElementById('adminProductPrice').value = product.price;
        document.getElementById('adminProductStock').value = product.stock;
        document.getElementById('adminProductImage').value = product.image;
        document.getElementById('adminProductDescription').value = product.description;
        document.getElementById('adminProductSave').textContent = 'Actualizar producto';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('adminProductName').focus();
      }
    } catch (error) {
      alert(error.message || 'No se pudo completar la operación.');
    }
  });

  refresh().catch((error) => list.append(element('p', 'admin-feedback', error.message)));
}

function initializeMediaAdmin() {
  const mediaService = new MediaService(new IndexedDbMediaRepository());
  const form = document.getElementById('adminMediaForm');
  const list = document.getElementById('adminMediaList');
  const count = document.getElementById('adminMediaCount');
  const typeInput = document.getElementById('adminMediaType');
  const fileInput = document.getElementById('adminMediaFile');

  function reset() {
    form.reset();
    document.getElementById('adminMediaId').value = '';
    document.getElementById('adminMediaSave').textContent = 'Agregar a la biblioteca';
    typeInput.disabled = false;
    document.getElementById('adminMediaFileNote').hidden = true;
    fileInput.required = true;
    updateMediaFields();
  }

  function updateMediaFields() {
    const music = typeInput.value === 'music';
    document.getElementById('adminMediaArtistField').hidden = !music;
    document.getElementById('adminMediaDescriptionField').hidden = music;
    fileInput.accept = music ? 'audio/*' : typeInput.value === 'image' ? 'image/*' : 'video/*';
  }

  function render(library) {
    mediaObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    mediaObjectUrls = [];
    list.replaceChildren();
    const items = Object.values(library).flat();
    count.textContent = `${items.length} archivo${items.length === 1 ? '' : 's'}`;
    if (!items.length) {
      list.append(element('div', 'empty-state', 'Todavía no hay archivos audiovisuales en la biblioteca.'));
      return;
    }

    items.forEach((item) => {
      mediaObjectUrls.push(item.url);
      const actions = element('div', 'admin-record-actions');
      actions.append(actionButton('Editar', 'edit-media', item.id));
      actions.append(actionButton('Eliminar', 'delete-media', item.id, 'delete-btn'));
      const detail = item.type === 'music' ? item.artist : item.description;
      list.append(recordRow(`${item.title} · ${item.type}`, detail || item.fileName, actions));
    });
  }

  async function refresh() {
    render(await mediaService.list());
  }

  typeInput.addEventListener('change', updateMediaFields);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('adminMediaId').value;
    const type = typeInput.value;
    const input = {
      id,
      type,
      title: document.getElementById('adminMediaTitle').value,
      artist: document.getElementById('adminMediaArtist').value,
      description: document.getElementById('adminMediaDescription').value
    };
    try {
      if (id) await mediaService.update(input);
      else await mediaService.add(input, fileInput.files[0]);
      reset();
      await refresh();
    } catch (error) {
      alert(error.message || 'No se pudo guardar el archivo multimedia.');
    }
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const currentLibrary = await mediaService.list();
    const item = Object.values(currentLibrary).flat().find((media) => media.id === button.dataset.id);
    if (!item) return;

    try {
      if (button.dataset.action === 'delete-media') {
        await mediaService.remove(item.id);
        if (document.getElementById('adminMediaId').value === item.id) reset();
        await refresh();
      } else {
        document.getElementById('adminMediaId').value = item.id;
        typeInput.value = item.type;
        typeInput.disabled = true;
        document.getElementById('adminMediaTitle').value = item.title;
        document.getElementById('adminMediaArtist').value = item.artist;
        document.getElementById('adminMediaDescription').value = item.description;
        document.getElementById('adminMediaSave').textContent = 'Actualizar información';
        document.getElementById('adminMediaFileNote').hidden = false;
        fileInput.required = false;
        updateMediaFields();
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('adminMediaTitle').focus();
      }
      Object.values(currentLibrary).flat().forEach((media) => URL.revokeObjectURL(media.url));
    } catch (error) {
      alert(error.message || 'No se pudo completar la operación.');
    }
  });

  document.querySelector('[data-reset-form="adminMediaForm"]').addEventListener('click', reset);
  updateMediaFields();
  refresh().catch((error) => list.append(element('p', 'admin-feedback', error.message)));
}

function initializeBlogAdmin() {
  const form = document.getElementById('adminBlogForm');
  const list = document.getElementById('adminBlogList');
  const sectionInput = document.getElementById('adminBlogSection');

  function reset() {
    form.reset();
    document.getElementById('adminBlogId').value = '';
    document.getElementById('adminBlogSave').textContent = 'Guardar publicación';
  }

  function render(posts) {
    list.replaceChildren();
    posts.forEach((post) => {
      const actions = element('div', 'admin-record-actions');
      actions.append(actionButton('Editar', 'edit-blog', post.id));
      actions.append(actionButton('Eliminar', 'delete-blog', post.id, 'delete-btn'));
      list.append(recordRow(post.title, `${BLOG_SECTION_LABELS[post.section]} · ${post.description}`, actions));
    });
    if (!posts.length) list.append(element('div', 'empty-state', 'Aún no hay publicaciones. Agrega una para mostrarla en Inicio.'));
  }

  function refresh() {
    render(blogRepository.list());
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('adminBlogId').value;
    const post = {
      id,
      section: sectionInput.value,
      title: document.getElementById('adminBlogTitle').value,
      description: document.getElementById('adminBlogDescription').value
    };
    try {
      if (id) blogRepository.update(post);
      else blogRepository.create(post);
      reset();
      refresh();
    } catch (error) {
      alert(error.message || 'No se pudo guardar la publicación.');
    }
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const post = blogRepository.list().find((item) => item.id === button.dataset.id);
    if (!post) return;
    try {
      if (button.dataset.action === 'delete-blog') {
        blogRepository.remove(post.id);
        refresh();
      } else {
        document.getElementById('adminBlogId').value = post.id;
        sectionInput.value = post.section;
        document.getElementById('adminBlogTitle').value = post.title;
        document.getElementById('adminBlogDescription').value = post.description;
        document.getElementById('adminBlogSave').textContent = 'Actualizar publicación';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('adminBlogTitle').focus();
      }
    } catch (error) {
      alert(error.message || 'No se pudo completar la operación.');
    }
  });

  document.querySelector('[data-reset-form="adminBlogForm"]').addEventListener('click', reset);
  try {
    refresh();
  } catch (error) {
    list.append(element('p', 'admin-feedback', error.message));
  }
}

function initializeConverterAdmin() {
  const form = document.getElementById('adminConverterForm');

  function render(info) {
    document.getElementById('adminConverterTitle').value = info.title;
    document.getElementById('adminConverterDescription').value = info.description;
    document.getElementById('adminConverterFileHint').value = info.fileHint;
    document.getElementById('adminConverterPrivacy').value = info.privacyNote;
  }

  try {
    render(converterRepository.get());
  } catch (error) {
    form.prepend(element('p', 'admin-feedback', error.message));
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      converterRepository.save({
        title: document.getElementById('adminConverterTitle').value,
        description: document.getElementById('adminConverterDescription').value,
        fileHint: document.getElementById('adminConverterFileHint').value,
        privacyNote: document.getElementById('adminConverterPrivacy').value
      });
      alert('La información de Video a MP3 se guardó correctamente.');
    } catch (error) {
      alert(error.message || 'No se pudo guardar la información.');
    }
  });
}

function openDashboard() {
  authPanel.hidden = true;
  dashboard.hidden = false;
  loadButton.hidden = false;
  if (dashboardInitialized) {
    activateSection(location.hash.slice(1));
    return;
  }
  dashboardInitialized = true;
  initializeProductAdmin();
  initializeMediaAdmin();
  initializeBlogAdmin();
  initializeConverterAdmin();
  activateSection(location.hash.slice(1));
}

document.querySelectorAll('[data-admin-section]').forEach((tab) => {
  tab.addEventListener('click', () => activateSection(tab.dataset.adminSection));
});

setupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = document.getElementById('setupPassword').value;
  if (password !== document.getElementById('setupPasswordConfirm').value) {
    showAuthError('Las contraseñas no coinciden.');
    return;
  }
  try {
    await auth.setup(document.getElementById('setupEmail').value, password);
    openDashboard();
  } catch (error) {
    showAuthError(error.message || 'No se pudo configurar el acceso.');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await auth.login(
      document.getElementById('loginEmail').value,
      document.getElementById('loginPassword').value
    );
    openDashboard();
  } catch (error) {
    showAuthError(error.message || 'No se pudo iniciar sesión.');
  }
});

document.getElementById('logoutButton').addEventListener('click', () => {
  auth.logout();
  loginForm.reset();
  feedback.hidden = true;
  prepareAuthScreen();
});

if (auth.isAuthenticated()) openDashboard();
else prepareAuthScreen();
