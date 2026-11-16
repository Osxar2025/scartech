const STORAGE_KEY = 'scartech-theme';
const toggle = document.querySelector('.theme-toggle');

if (toggle) {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  let theme = savedTheme === 'light' ? 'light' : 'dark';

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    toggle.setAttribute('aria-label', `Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`);
    toggle.setAttribute('aria-pressed', String(theme === 'light'));
  }

  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(STORAGE_KEY, theme);
    applyTheme();
  });

  applyTheme();
}