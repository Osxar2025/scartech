import assert from 'node:assert/strict';
import test from 'node:test';
import { ProductService } from '../src/application/product-service.js';
import { createProduct } from '../src/domain/product.js';

class InMemoryProductRepository {
  products = [];

  list() {
    return this.products;
  }

  create(product) {
    const saved = { ...product, id: 'product-1' };
    this.products.push(saved);
    return saved;
  }

  update(product) {
    const index = this.products.findIndex((item) => item.id === product.id);
    if (index < 0) throw new Error('Product not found');
    this.products[index] = product;
    return product;
  }

  remove(id) {
    this.products = this.products.filter((product) => product.id !== id);
  }
}

test('product domain rejects invalid names, prices, and stock values', () => {
  assert.throws(() => createProduct({ category: 'Audio', price: 10, stock: 1 }), /nombre/);
  assert.throws(() => createProduct({ name: 'Audífonos', category: 'Audio', price: -1, stock: 1 }), /precio/);
  assert.throws(() => createProduct({ name: 'Audífonos', category: 'Audio', price: 10, stock: 1.5 }), /stock/);
});

test('product service delegates create, update, list, and remove to its repository', async () => {
  const repository = new InMemoryProductRepository();
  const service = new ProductService(repository);

  await service.create({ name: 'Audífonos', category: 'Audio', price: 45, stock: 3 });
  assert.equal((await service.list()).length, 1);
  await service.update('product-1', { name: 'Audífonos Pro', category: 'Audio', price: 55, stock: 2 });
  assert.equal((await service.list())[0].name, 'Audífonos Pro');
  await service.remove('product-1');
  assert.equal((await service.list()).length, 0);
});
