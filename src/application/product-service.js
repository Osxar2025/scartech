import { createProduct } from '../domain/product.js';

export class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  list() {
    return this.repository.list();
  }

  async create(input) {
    const product = createProduct(input);
    return this.repository.create(product);
  }

  async update(id, input) {
    const product = createProduct(input, id);
    return this.repository.update(product);
  }

  remove(id) {
    return this.repository.remove(id);
  }
}
