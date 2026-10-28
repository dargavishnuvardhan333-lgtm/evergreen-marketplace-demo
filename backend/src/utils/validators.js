export function isValidEmail(value) {
  return typeof value === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    && value.length <= 254;
}

export function isNonEmptyString(value, maxLength = 500) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

export function isValidPrice(value) {
  return Number.isFinite(value)
    && value >= 0
    && Math.abs(value * 100 - Math.round(value * 100)) < 0.000001;
}

export function isValidQuantity(value) {
  return Number.isInteger(value) && value > 0 && value <= 100;
}

export function isValidImageUrl(value) {
  if (value === undefined || value === '') return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateProductInput(input) {
  const errors = [];
  if (!isNonEmptyString(input.name, 120)) errors.push('Name is required and must be at most 120 characters.');
  if (!isNonEmptyString(input.description, 2000)) errors.push('Description is required and must be at most 2000 characters.');
  if (!isNonEmptyString(input.category, 80)) errors.push('Category is required and must be at most 80 characters.');
  if (!isValidPrice(input.price)) errors.push('Price must be a non-negative number.');
  if (!Number.isInteger(input.stock) || input.stock < 0 || input.stock > 100000) errors.push('Stock must be a non-negative whole number.');
  if (!isValidImageUrl(input.imageUrl)) errors.push('Image URL must be a valid HTTP or HTTPS URL.');
  return errors;
}

export function validateShippingAddress(address) {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return ['Shipping address is required.'];
  }
  const errors = [];
  for (const [field, label] of [['fullName', 'Full name'], ['line1', 'Address'], ['city', 'City'], ['postalCode', 'Postal code'], ['country', 'Country']]) {
    if (!isNonEmptyString(address[field], 120)) errors.push(`${label} is required.`);
  }
  if (address.line2 !== undefined && (typeof address.line2 !== 'string' || address.line2.length > 120)) {
    errors.push('Address line 2 must be text and at most 120 characters.');
  }
  return errors;
}
