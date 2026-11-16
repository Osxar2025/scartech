import { BLOG_SECTION_LABELS, LocalStorageBlogRepository } from '../infrastructure/local-storage-admin-repositories.js';
import { element } from './dom.js';

const grid = document.querySelector('.blog-grid');
const repository = new LocalStorageBlogRepository();

function render(posts) {
  grid.replaceChildren();
  posts.forEach((post, index) => {
    const card = element('article', `blog-card panel${post.section === 'inventory' ? ' blog-card-accent' : ''}`);
    const indexLabel = String(index + 1).padStart(2, '0');
    card.append(element('span', 'blog-card-index', `${indexLabel} · ${BLOG_SECTION_LABELS[post.section].toUpperCase()}`));
    card.append(element('h3', '', post.title));
    card.append(element('p', '', post.description));

    const link = element('a', 'blog-card-link');
    link.href = post.href;
    link.setAttribute('aria-label', `Ir a ${BLOG_SECTION_LABELS[post.section]}`);
    link.append(element('span', 'blog-action-short', 'Ir'));
    link.append(element('span', 'blog-action-full', `Ir a ${BLOG_SECTION_LABELS[post.section]}`));
    link.lastElementChild.setAttribute('aria-hidden', 'true');
    link.firstElementChild.setAttribute('aria-hidden', 'true');
    link.append(element('span', 'blog-action-arrow', '↗'));
    link.lastElementChild.setAttribute('aria-hidden', 'true');
    card.append(link);
    grid.append(card);
  });
}

try {
  render(repository.list());
} catch (error) {
  console.error('No se pudieron cargar las publicaciones.', error);
  grid.replaceChildren(element('p', 'empty-state', error.message));
}
