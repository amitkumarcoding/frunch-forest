// A product is out of stock if it's explicitly marked so, or its
// tracked stock quantity has hit zero. `stock` is optional — when
// it's not a number, only the inStock checkbox decides.
export function isOutOfStock(product) {
  if (!product) return true;
  if (product.inStock === false) return true;
  if (typeof product.stock === "number" && product.stock <= 0) return true;
  return false;
}
