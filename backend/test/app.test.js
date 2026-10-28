import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('health endpoint reports API status without requiring a database', async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', database: 'disconnected' });
});

test('unknown API routes return a safe not-found response', async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/missing`);
  assert.equal(response.status, 404);
  assert.match((await response.json()).error, /Route not found/);
});

test('admin product creation rejects unauthenticated requests before database access', async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Attempted product' }),
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Authentication required.' });
});

test('invalid registration input is rejected without creating an account', async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'invalid', password: 'short', role: 'admin' }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid email/);
});
