import { createMediaItem } from '../domain/media-item.js';

export class MediaService {
  constructor(repository) {
    this.repository = repository;
  }

  list() {
    return this.repository.list();
  }

  async add(input, file) {
    if (!file) throw new Error('Selecciona un archivo multimedia.');
    const item = createMediaItem({
      ...input,
      fileName: file.name,
      size: Number((file.size / (1024 * 1024)).toFixed(2))
    });
    return this.repository.create(item, file);
  }

  remove(id) {
    return this.repository.remove(id);
  }
}
