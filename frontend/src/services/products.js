const configuredRate = Number(import.meta.env.VITE_USD_TO_INR);
// Display-only conversion rate; this is not a live foreign-exchange quote.
export const USD_TO_INR = Number.isFinite(configuredRate) && configuredRate > 0 ? configuredRate : 83;
export const PRODUCTS_API = 'https://dummyjson.com/products?limit=0';

export function priceInRupees(product) {
  return Number(product.price) * USD_TO_INR;
}

export function originalPriceInRupees(product) {
  const discount = Number(product.discountPercentage) || 0;
  return discount > 0 && discount < 100 ? priceInRupees(product) / (1 - discount / 100) : priceInRupees(product);
}

export function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function productImage(product) {
  return product.thumbnail || product.images?.[0] || '';
}

export function categoryLabel(category) {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
