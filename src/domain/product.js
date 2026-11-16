export function createProduct(input, id = input.id) {
  const name = String(input.name ?? '').trim();
  const category = String(input.category ?? '').trim();
  const price = Number(input.price);
  const stock = Number(input.stock);

  if (!name) throw new Error('El nombre del producto es obligatorio.');
  if (!category) throw new Error('La categoría del producto es obligatoria.');
  if (!Number.isFinite(price) || price < 0) throw new Error('El precio debe ser un número válido.');
  if (!Number.isInteger(stock) || stock < 0) throw new Error('El stock debe ser un entero no negativo.');

  return {
    id: id ?? null,
    name,
    category,
    price,
    stock,
    image: String(input.image ?? '').trim(),
    description: String(input.description ?? '').trim()
  };
}
