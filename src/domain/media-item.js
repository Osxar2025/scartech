export const MEDIA_TYPES = Object.freeze(['music', 'image', 'video']);

export function createMediaItem(input, id = input.id) {
  const type = String(input.type ?? '').trim().toLowerCase();
  const title = String(input.title ?? '').trim();

  if (!MEDIA_TYPES.includes(type)) throw new Error('El tipo de archivo no es válido.');
  if (!title) throw new Error('El título es obligatorio.');
  return {
    id: id ?? null,
    type,
    title,
    description: String(input.description ?? '').trim(),
    artist: String(input.artist ?? '').trim(),
    url: String(input.url ?? ''),
    fileName: String(input.fileName ?? '').trim(),
    size: Number(input.size) || 0,
    timestamp: input.timestamp ?? new Date().toISOString()
  };
}
