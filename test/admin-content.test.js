import assert from 'node:assert/strict';
import test from 'node:test';
import { createBlogPost } from '../src/domain/blog-post.js';
import { LocalStorageBlogRepository, LocalStorageConverterInfoRepository } from '../src/infrastructure/local-storage-admin-repositories.js';
import { LocalStorageJson } from '../src/infrastructure/local-storage-json.js';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test('blog publication destination is controlled by its section', () => {
  const post = createBlogPost({
    section: 'inventory',
    title: 'Administrar el catálogo',
    description: 'Publica tus productos.'
  });
  assert.equal(post.href, 'administrador.html#products');
  assert.throws(() => createBlogPost({ section: 'https://bad.example', title: 'x', description: 'y' }), /sección/);
});

test('blog repository creates, edits, and deletes published entries', () => {
  const repository = new LocalStorageBlogRepository(new LocalStorageJson(new MemoryStorage()));
  const post = repository.create({ section: 'media', title: 'Nueva guía', description: 'Guía audiovisual.' });
  assert.equal(repository.list().length, 5);
  repository.update({ ...post, title: 'Guía actualizada' });
  assert.equal(repository.list().find((item) => item.id === post.id).title, 'Guía actualizada');
  repository.remove(post.id);
  assert.equal(repository.list().length, 4);
});

test('converter information is validated and persisted for its public page', () => {
  const repository = new LocalStorageConverterInfoRepository(new LocalStorageJson(new MemoryStorage()));
  const updated = repository.save({
    title: 'Video a MP3',
    description: 'Descripción actualizada.',
    fileHint: 'MP4',
    privacyNote: 'Procesamiento local.'
  });
  assert.equal(repository.get().description, updated.description);
  assert.throws(() => repository.save({ ...updated, privacyNote: '' }), /Completa todos/);
});
