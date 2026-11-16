const loadDestinations = [
  { label: 'Cargar productos', href: 'tienda.html' },
  { label: 'Cargar audiovisuales', href: 'audiovisuales.html' }
];

function createMenu(label, icon, items, className) {
  const menu = document.createElement('div');
  menu.className = `floating-menu ${className}`;

  const button = document.createElement('button');
  button.className = 'floating-action-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${className}-actions`);
  button.innerHTML = `<span aria-hidden="true">${icon}</span>`;

  const actionList = document.createElement('div');
  actionList.className = 'floating-menu-actions';
  actionList.id = `${className}-actions`;
  actionList.setAttribute('aria-label', label);

  items.forEach((item) => {
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    actionList.append(link);
  });

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.floating-action-toggle[aria-expanded="true"]')
      .forEach((openButton) => openButton.setAttribute('aria-expanded', 'false'));
    button.setAttribute('aria-expanded', String(!expanded));
  });

  menu.addEventListener('focusout', (event) => {
    if (!menu.contains(event.relatedTarget)) button.setAttribute('aria-expanded', 'false');
  });

  menu.append(button, actionList);
  return menu;
}

const actions = document.createElement('aside');
actions.className = 'floating-actions';
actions.setAttribute('aria-label', 'Cargar contenido');
actions.append(createMenu('Cargar contenido', '+', loadDestinations, 'floating-upload-menu'));
document.body.append(actions);
