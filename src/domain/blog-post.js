const SECTION_PATHS = Object.freeze({
  store: 'index.html',
  converter: 'video-a-mp3.html',
  media: 'audiovisuales.html',
  inventory: 'administrador.html#products'
});

export const BLOG_SECTIONS = Object.freeze(Object.keys(SECTION_PATHS));

export function createBlogPost(input, id = input.id) {
  const section = String(input.section ?? '').trim();
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();

  if (!BLOG_SECTIONS.includes(section)) throw new Error('Selecciona una sección válida.');
  if (!title) throw new Error('El título de la publicación es obligatorio.');
  if (!description) throw new Error('La descripción de la publicación es obligatoria.');

  return {
    id: id ?? null,
    section,
    title,
    description,
    ctaLabel: String(input.ctaLabel ?? '').trim() || 'Ir',
    href: SECTION_PATHS[section]
  };
}
