let library = {
  music: [],
  image: [],
  video: []
};

let currentFilter = 'all';
let selectedFile = null;
let selectedType = 'music';

// Cargar datos guardados al iniciar
document.addEventListener('DOMContentLoaded', () => {
  loadLibrary();
  initEventListeners();
  renderLibrary();
});

// Inicializar event listeners
function initEventListeners() {
  // Tabs de upload
  document.querySelectorAll('.upload-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchUploadTab(e.currentTarget.dataset.type, e.currentTarget);
    });
  });

  // Botones de agregar
  const addMusicBtn = document.getElementById('addMusicBtn');
  const addImageBtn = document.getElementById('addImageBtn');
  const addVideoBtn = document.getElementById('addVideoBtn');

  if (addMusicBtn) addMusicBtn.addEventListener('click', addMusic);
  if (addImageBtn) addImageBtn.addEventListener('click', addImage);
  if (addVideoBtn) addVideoBtn.addEventListener('click', addVideo);

  // File inputs
  const musicInput = document.getElementById('musicInput');
  const imageInput = document.getElementById('imageInput');
  const videoInput = document.getElementById('videoInput');

  if (musicInput) musicInput.addEventListener('change', (e) => handleFileSelect(e, 'music'));
  if (imageInput) imageInput.addEventListener('change', (e) => handleFileSelect(e, 'image'));
  if (videoInput) videoInput.addEventListener('change', (e) => handleFileSelect(e, 'video'));

  // Click en labels para abrir file picker
  document.querySelectorAll('.upload-label').forEach(label => {
    label.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const input = label.querySelector('input[type="file"]');
        if (input) input.click();
      }
    });
  });

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterLibrary(e.currentTarget.dataset.filter, e.currentTarget);
    });
  });
}

// Cambiar tab de upload
function switchUploadTab(type, btn) {
  selectedType = type;

  document.querySelectorAll('.upload-tab-btn').forEach(item => {
    item.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.upload-section').forEach(section => {
    section.classList.remove('active');
  });
  const section = document.getElementById(`${type}-section`);
  if (section) section.classList.add('active');
}

// Manejar selección de archivo
function handleFileSelect(e, type) {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    const fieldId = type === 'music' ? 'musicTitle' : 
                    type === 'image' ? 'imageTitle' : 'videoTitle';
    document.getElementById(fieldId).focus();
  }
}

// Agregar música
async function addMusic() {
  const title = document.getElementById('musicTitle').value.trim();
  const artist = document.getElementById('musicArtist').value.trim();

  if (!title) {
    alert('Por favor ingresa un título para la pista');
    return;
  }

  if (!selectedFile) {
    alert('Por favor selecciona un archivo de música');
    return;
  }

  const payload = {
    type: 'music',
    title,
    artist: artist || 'Artista desconocido',
    url: URL.createObjectURL(selectedFile),
    file_name: selectedFile.name,
    size: Number((selectedFile.size / (1024 * 1024)).toFixed(2))
  };

  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'No se pudo guardar la pista');
    }

    await loadLibrary();
    renderLibrary();
    clearMusicForm();
  } catch (error) {
    alert(error.message || 'Error al guardar la pista');
  }
}

// Agregar imagen
async function addImage() {
  const title = document.getElementById('imageTitle').value.trim();
  const description = document.getElementById('imageDescription').value.trim();

  if (!title) {
    alert('Por favor ingresa un título para la imagen');
    return;
  }

  if (!selectedFile) {
    alert('Por favor selecciona un archivo de imagen');
    return;
  }

  const payload = {
    type: 'image',
    title,
    description,
    url: URL.createObjectURL(selectedFile),
    file_name: selectedFile.name,
    size: Number((selectedFile.size / (1024 * 1024)).toFixed(2))
  };

  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'No se pudo guardar la imagen');
    }

    await loadLibrary();
    renderLibrary();
    clearImageForm();
  } catch (error) {
    alert(error.message || 'Error al guardar la imagen');
  }
}

// Agregar video
async function addVideo() {
  const title = document.getElementById('videoTitle').value.trim();
  const description = document.getElementById('videoDescription').value.trim();

  if (!title) {
    alert('Por favor ingresa un título para el video');
    return;
  }

  if (!selectedFile) {
    alert('Por favor selecciona un archivo de video');
    return;
  }

  const payload = {
    type: 'video',
    title,
    description,
    url: URL.createObjectURL(selectedFile),
    file_name: selectedFile.name,
    size: Number((selectedFile.size / (1024 * 1024)).toFixed(2))
  };

  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'No se pudo guardar el video');
    }

    await loadLibrary();
    renderLibrary();
    clearVideoForm();
  } catch (error) {
    alert(error.message || 'Error al guardar el video');
  }
}

// Limpiar formularios
function clearMusicForm() {
  document.getElementById('musicTitle').value = '';
  document.getElementById('musicArtist').value = '';
  document.getElementById('musicInput').value = '';
  selectedFile = null;
}

function clearImageForm() {
  document.getElementById('imageTitle').value = '';
  document.getElementById('imageDescription').value = '';
  document.getElementById('imageInput').value = '';
  selectedFile = null;
}

function clearVideoForm() {
  document.getElementById('videoTitle').value = '';
  document.getElementById('videoDescription').value = '';
  document.getElementById('videoInput').value = '';
  selectedFile = null;
}

// Filtrar biblioteca
function filterLibrary(filter, btn) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(item => {
    item.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  renderLibrary();
}

// Renderizar biblioteca
function renderLibrary() {
  const grid = document.getElementById('libraryGrid');
  const emptyState = document.getElementById('emptyState');
  
  // Obtener items a mostrar
  let items = [];
  if (currentFilter === 'all') {
    items = [...library.music, ...library.image, ...library.video];
  } else {
    items = library[currentFilter] || [];
  }

  // Ordenar por timestamp más reciente primero
  items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Mostrar/ocultar empty state
  if (items.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  grid.innerHTML = items.map(item => createItemCard(item)).join('');

  // Agregar event listeners a los botones de acción
  document.querySelectorAll('.library-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const itemId = parseInt(e.target.dataset.id);
      handleItemAction(action, itemId, currentFilter);
    });
  });
}

// Crear tarjeta de item
function createItemCard(item) {
  let mediaHtml = '';

  if (item.type === 'music') {
    mediaHtml = `
      <div class="library-item-media library-item-audio">
        <div style="font-size: 48px;">♪</div>
      </div>
    `;
  } else if (item.type === 'image') {
    mediaHtml = `
      <div class="library-item-media">
        <img src="${item.url}" alt="${item.title}">
      </div>
    `;
  } else if (item.type === 'video') {
    mediaHtml = `
      <div class="library-item-media">
        <video src="${item.url}"></video>
      </div>
    `;
  }

  let contentHtml = '';
  if (item.type === 'music') {
    contentHtml = `
      <div class="library-item-title">${item.title}</div>
      <div class="library-item-subtitle">${item.artist}</div>
      <div class="library-item-subtitle">${item.size}</div>
    `;
  } else {
    contentHtml = `
      <div class="library-item-title">${item.title}</div>
      ${item.description ? `<div class="library-item-description">${item.description}</div>` : ''}
      <div class="library-item-subtitle">${item.size}</div>
    `;
  }

  return `
    <div class="library-item" data-id="${item.id}" data-type="${item.type}">
      ${mediaHtml}
      <div class="library-item-content">
        ${contentHtml}
        <div class="library-item-actions">
          <button class="library-item-btn" data-action="download" data-id="${item.id}" data-type="${item.type}">⬇️ Descargar</button>
          <button class="library-item-btn" data-action="delete" data-id="${item.id}" data-type="${item.type}">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

// Manejar acciones de items
function handleItemAction(action, itemId, type) {
  const typeKey = type === 'all' ? null : type;
  
  if (action === 'delete') {
    // Buscar y eliminar el item en todos los tipos si es necesario
    let found = false;
    ['music', 'image', 'video'].forEach(key => {
      library[key] = library[key].filter(item => {
        if (item.id === itemId) {
          URL.revokeObjectURL(item.url);
          found = true;
          return false;
        }
        return true;
      });
    });
    
    if (found) {
      saveLibrary();
      renderLibrary();
    }
  } else if (action === 'download') {
    downloadItem(itemId);
  }
}

// Descargar item
function downloadItem(itemId) {
  let item = null;
  ['music', 'image', 'video'].forEach(key => {
    const found = library[key].find(i => i.id === itemId);
    if (found) item = found;
  });

  if (item) {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Guardar biblioteca en localStorage
function saveLibrary() {
  return true;
}

// Cargar biblioteca desde API
async function loadLibrary() {
  try {
    const response = await fetch('/api/media');
    if (!response.ok) throw new Error('No se pudo cargar la biblioteca');
    const data = await response.json();
    library.music = data.music || [];
    library.image = data.image || [];
    library.video = data.video || [];
    return;
  } catch (error) {
    console.error('Error al cargar biblioteca:', error);
    library.music = [];
    library.image = [];
    library.video = [];
  }
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
