import { createBlogPost } from '../domain/blog-post.js';
import { createConverterInfo } from '../domain/converter-info.js';
import { LocalStorageJson } from './local-storage-json.js';

const BLOG_KEY = 'scartechBlogPosts';
const CONVERTER_KEY = 'scartechConverterInfo';
const BLOG_DEFAULTS = [
  { section: 'store', title: 'Herramientas para tu espacio de trabajo', description: 'Encuentra productos de tecnología y accesorios para estudiar, crear y mejorar tu productividad. Revisa el catálogo y sus detalles en un solo lugar.' },
  { section: 'converter', title: 'Convierte tus videos en audio', description: 'Extrae audio de tus propios archivos de video y guárdalo como MP3. El procesamiento se realiza localmente en tu navegador.' },
  { section: 'media', title: 'Organiza tus recursos audiovisuales', description: 'Reúne música, imágenes y videos en tu biblioteca, filtra los recursos por tipo y ten tus archivos creativos a mano.' },
  { section: 'inventory', title: 'Publica productos en tu catálogo', description: 'Agrega productos, completa su información y administra el inventario para que aparezcan en la tienda.' }
];
export const DEFAULT_CONVERTER_INFO = Object.freeze({
  title: 'Video → MP3',
  description: 'Sube un video tuyo y extrae el audio como MP3. Todo ocurre dentro de tu navegador — el archivo nunca se sube a ningún servidor.',
  fileHint: 'MP4, MOV, WEBM, MKV — procesado en tu navegador',
  privacyNote: 'Esta herramienta convierte únicamente archivos que subes desde tu propio dispositivo. No descarga contenido de sitios web ni de plataformas de video.'
});

export class LocalStorageBlogRepository {
  constructor(storage = new LocalStorageJson()) {
    this.storage = storage;
  }

  list() {
    const posts = this.storage.read(BLOG_KEY, BLOG_DEFAULTS.map((post, index) => createBlogPost(post, `default-${index + 1}`)));
    return posts.map((post) => createBlogPost(post, post.id));
  }

  create(input) {
    const posts = this.list();
    const post = createBlogPost(input, crypto.randomUUID());
    this.storage.write(BLOG_KEY, [...posts, post]);
    return post;
  }

  update(input) {
    const posts = this.list();
    const index = posts.findIndex((post) => post.id === input.id);
    if (index < 0) throw new Error('No se encontró la publicación que quieres actualizar.');
    posts[index] = createBlogPost(input, input.id);
    this.storage.write(BLOG_KEY, posts);
    return posts[index];
  }

  remove(id) {
    const posts = this.list();
    const nextPosts = posts.filter((post) => post.id !== id);
    if (nextPosts.length === posts.length) throw new Error('No se encontró la publicación que quieres eliminar.');
    this.storage.write(BLOG_KEY, nextPosts);
  }
}

export class LocalStorageConverterInfoRepository {
  constructor(storage = new LocalStorageJson()) {
    this.storage = storage;
  }

  get() {
    return createConverterInfo(this.storage.read(CONVERTER_KEY, DEFAULT_CONVERTER_INFO));
  }

  save(input) {
    const info = createConverterInfo(input);
    this.storage.write(CONVERTER_KEY, info);
    return info;
  }
}

export const BLOG_SECTION_LABELS = Object.freeze({
  store: 'Tienda',
  converter: 'Video a MP3',
  media: 'Audiovisuales',
  inventory: 'Administrador · Productos'
});
