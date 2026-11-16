export class AdminAuthService {
  constructor(storage, passwordHasher, cryptoApi = window.crypto, sessionStorage = window.sessionStorage) {
    this.storage = storage;
    this.passwordHasher = passwordHasher;
    this.cryptoApi = cryptoApi;
    this.sessionStorage = sessionStorage;
  }

  isConfigured() {
    return this.storage.getItem('scartechAdminCredential') !== null;
  }

  isAuthenticated() {
    return this.sessionStorage.getItem('scartechAdminSession') === 'active';
  }

  async setup(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Ingresa un correo electrónico válido.');
    }
    if (password.length < 12) throw new Error('La contraseña debe tener al menos 12 caracteres.');
    if (this.isConfigured()) throw new Error('El acceso de administrador ya está configurado.');

    const salt = Array.from(this.cryptoApi.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0')).join('');
    const passwordHash = await this.passwordHasher.hash(password, salt);
    this.storage.setItem('scartechAdminCredential', JSON.stringify({
      email: normalizedEmail,
      salt,
      passwordHash
    }));
    this.sessionStorage.setItem('scartechAdminSession', 'active');
  }

  async login(email, password) {
    const stored = this.storage.getItem('scartechAdminCredential');
    if (!stored) throw new Error('Configura primero el acceso de administrador en este navegador.');

    let credential;
    try {
      credential = JSON.parse(stored);
    } catch (error) {
      throw new Error('La configuración de acceso está dañada. Borra los datos locales de ScarTech y vuelve a configurarla.', { cause: error });
    }

    const passwordHash = await this.passwordHasher.hash(password, credential.salt);
    if (email.trim().toLowerCase() !== credential.email || passwordHash !== credential.passwordHash) {
      throw new Error('Correo o contraseña incorrectos.');
    }
    this.sessionStorage.setItem('scartechAdminSession', 'active');
  }

  logout() {
    this.sessionStorage.removeItem('scartechAdminSession');
  }
}
