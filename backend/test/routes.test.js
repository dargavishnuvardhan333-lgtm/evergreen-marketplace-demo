import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import app from '../src/app.js';

const testSecret = 'automated-test-only-secret-with-more-than-32-characters';
process.env.JWT_SECRET = testSecret;

async function startServer(t) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

function tokenFor(id) {
  return jwt.sign({ sub: id }, testSecret);
}

function mockAuthenticatedUser(t, user) {
  t.mock.method(User, 'findById', () => ({
    select: async () => user,
  }));
}

test('register and login hash passwords and never accept a submitted administrator role', async (t) => {
  const id = '507f1f77bcf86cd799439011';
  let createdValues;
  const user = { id, name: 'Alex Doe', email: 'alex@example.com', role: 'user' };
  t.mock.method(User, 'exists', async () => null);
  t.mock.method(User, 'create', async (values) => {
    createdValues = values;
    return { ...user, ...values, id };
  });
  t.mock.method(User, 'findOne', () => ({
    select: async () => ({ ...user, passwordHash: createdValues.passwordHash }),
  }));

  const baseUrl = await startServer(t);
  const registration = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: 'correct-horse-battery',
      role: 'admin',
    }),
  });
  assert.equal(registration.status, 201);
  const registered = await registration.json();
  assert.equal(registered.user.role, 'user');
  assert.equal(Object.hasOwn(createdValues, 'role'), false);
  assert.notEqual(createdValues.passwordHash, 'correct-horse-battery');
  assert.equal(await bcrypt.compare('correct-horse-battery', createdValues.passwordHash), true);
  assert.equal(jwt.verify(registered.token, testSecret).sub, id);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: 'correct-horse-battery' }),
  });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.role, 'user');
});

test('protected routes reject absent and invalid authentication tokens', async (t) => {
  const baseUrl = await startServer(t);
  const missing = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(missing.status, 401);
  assert.deepEqual(await missing.json(), { error: 'Authentication required.' });

  const invalid = await fetch(`${baseUrl}/api/orders/my-orders`, {
    headers: { Authorization: 'Bearer invalid-token' },
  });
  assert.equal(invalid.status, 401);
});

test('authenticated customers cannot access administrator product or order endpoints', async (t) => {
  const id = '507f1f77bcf86cd799439011';
  mockAuthenticatedUser(t, { _id: id, id, role: 'user' });
  const baseUrl = await startServer(t);
  const headers = { Authorization: `Bearer ${tokenFor(id)}`, 'Content-Type': 'application/json' };

  const createProduct = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  assert.equal(createProduct.status, 403);

  const allOrders = await fetch(`${baseUrl}/api/orders`, {
    headers: { Authorization: `Bearer ${tokenFor(id)}` },
  });
  assert.equal(allOrders.status, 403);
});

test('checkout rejects invalid shipping details and malformed product lines', async (t) => {
  const id = '507f1f77bcf86cd799439011';
  mockAuthenticatedUser(t, { _id: id, id, role: 'user' });
  const baseUrl = await startServer(t);
  const headers = { Authorization: `Bearer ${tokenFor(id)}`, 'Content-Type': 'application/json' };

  const invalidAddress = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ items: [{ productId: id, quantity: 1 }], shippingAddress: {} }),
  });
  assert.equal(invalidAddress.status, 400);

  const invalidProductLine = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      items: [{ productId: 'not-an-object-id', quantity: 1 }],
      shippingAddress: {
        fullName: 'Alex Doe',
        line1: '1 Main Street',
        city: 'Town',
        postalCode: '12345',
        country: 'US',
      },
    }),
  });
  assert.equal(invalidProductLine.status, 400);
});

test('customers cannot read orders belonging to other customers', async (t) => {
  const customerId = '507f1f77bcf86cd799439011';
  const otherCustomerId = '507f1f77bcf86cd799439012';
  const orderId = '507f1f77bcf86cd799439013';
  mockAuthenticatedUser(t, { _id: customerId, id: customerId, role: 'user' });
  t.mock.method(Order, 'findById', () => ({
    populate() {
      return {
        lean: async () => ({ _id: orderId, user: { _id: otherCustomerId } }),
      };
    },
  }));

  const baseUrl = await startServer(t);
  const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${tokenFor(customerId)}` },
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'You cannot access this order.' });
});

test('CORS permits the active local Vite fallback port', async (t) => {
  const baseUrl = await startServer(t);
  const response = await fetch(`${baseUrl}/api/health`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5174',
      'Access-Control-Request-Method': 'GET',
    },
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5174');
});
