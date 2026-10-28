import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidImageUrl,
  isValidPrice,
  isValidQuantity,
  validateProductInput,
  validateShippingAddress,
} from '../src/utils/validators.js';

test('validates email, price, quantity, and image URL boundaries', () => {
  assert.equal(isValidEmail('person@example.com'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidPrice(12.5), true);
  assert.equal(isValidPrice(-1), false);
  assert.equal(isValidQuantity(1), true);
  assert.equal(isValidQuantity(0), false);
  assert.equal(isValidQuantity(1.5), false);
  assert.equal(isValidImageUrl('https://example.com/image.png'), true);
  assert.equal(isValidImageUrl('javascript:alert(1)'), false);
});

test('requires complete product values and a shipping address', () => {
  assert.deepEqual(validateProductInput({
    name: 'Mug', description: 'Stoneware mug', price: 12, category: 'Home', stock: 3,
  }), []);
  assert.ok(validateProductInput({ name: '', price: -1, stock: -1 }).length >= 4);
  assert.deepEqual(validateShippingAddress({
    fullName: 'Alex Doe', line1: '1 Main St', city: 'Town', postalCode: '12345', country: 'US',
  }), []);
  assert.ok(validateShippingAddress({}).length >= 5);
});
