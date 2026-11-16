import assert from 'node:assert/strict';
import test from 'node:test';
import { MediaService } from '../src/application/media-service.js';

class InMemoryMediaRepository {
  items = [];

  list() {
    return { music: this.items.filter((item) => item.type === 'music'), image: [], video: [] };
  }

  create(item, file) {
    const saved = { ...item, id: 'media-1', url: 'blob:media-1' };
    this.items.push(saved);
    this.file = file;
    return saved;
  }

  remove(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

test('media service passes the selected file to its repository adapter', async () => {
  const repository = new InMemoryMediaRepository();
  const service = new MediaService(repository);
  const file = { name: 'demo.mp3', size: 1024 };
  await service.add({ type: 'music', title: 'Demo', artist: 'ScarTech' }, file);

  const library = await service.list();
  assert.equal(library.music[0].url, 'blob:media-1');
  assert.equal(library.music[0].fileName, 'demo.mp3');
  assert.equal(repository.file, file);
});

test('media service rejects empty file selections', async () => {
  const service = new MediaService(new InMemoryMediaRepository());
  await assert.rejects(() => service.add({ type: 'image', title: 'Cover' }, null), /Selecciona/);
});
