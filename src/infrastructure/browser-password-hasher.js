const ITERATIONS = 310000;
const KEY_LENGTH = 256;

export class BrowserPasswordHasher {
  constructor(cryptoApi = window.crypto) {
    this.cryptoApi = cryptoApi;
  }

  async hash(password, salt) {
    const encoder = new TextEncoder();
    const key = await this.cryptoApi.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await this.cryptoApi.subtle.deriveBits({
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256'
    }, key, KEY_LENGTH);
    return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
