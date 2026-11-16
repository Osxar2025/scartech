import assert from 'node:assert/strict';
import test from 'node:test';
import { AdminAuthService } from '../src/application/admin-auth-service.js';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function createAuth() {
  const credentials = new MemoryStorage();
  const session = new MemoryStorage();
  const cryptoApi = {
    getRandomValues(bytes) {
      bytes.fill(7);
      return bytes;
    }
  };
  const hasher = { hash: async (password, salt) => `hash:${salt}:${password.length}` };
  return {
    auth: new AdminAuthService(credentials, hasher, cryptoApi, session),
    credentials,
    session
  };
}

test('admin setup validates credentials and never persists the raw password', async () => {
  const { auth, credentials } = createAuth();
  await assert.rejects(() => auth.setup('admin@example.com', 'short'), /12 caracteres/);
  await auth.setup('ADMIN@example.com', 'a-long-demo-password');

  assert.equal(auth.isConfigured(), true);
  assert.equal(auth.isAuthenticated(), true);
  const record = credentials.getItem('scartechAdminCredential');
  assert.equal(record.includes('a-long-demo-password'), false);
  assert.equal(JSON.parse(record).email, 'admin@example.com');
});

test('admin login checks email and password and logout clears only the session', async () => {
  const { auth } = createAuth();
  await auth.setup('admin@example.com', 'a-long-demo-password');
  auth.logout();
  await assert.rejects(() => auth.login('admin@example.com', 'incorrect-password'), /incorrectos/);
  await auth.login('ADMIN@example.com', 'a-long-demo-password');
  assert.equal(auth.isAuthenticated(), true);
  auth.logout();
  assert.equal(auth.isConfigured(), true);
  assert.equal(auth.isAuthenticated(), false);
});
