import { getContentLanguageKey } from './i18n.js';

function sortProjects(projects) {
  return [...projects]
    .filter((project) => project.featured)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

function createTagList(items, className) {
  const list = document.createElement('ul');
  list.className = className;

  items.forEach((item) => {
    const entry = document.createElement('li');
    entry.className = className === 'timeline-tags' ? 'timeline-tag' : 'chip';
    entry.textContent = item;
    list.append(entry);
  });

  return list;
}

function statusLabel(status, dict) {
  return dict?.projects?.status?.[status] || status;
}

function categoryLabel(category, dict) {
  return dict?.projects?.categories?.[category] || category;
}

export function renderProjects({ container, emptyNode, projects, lang, dict }) {
  if (!container) return;

  const contentLang = getContentLanguageKey(lang);
  const visibleProjects = sortProjects(projects);
  container.innerHTML = '';

  if (!visibleProjects.length) {
    if (emptyNode) emptyNode.hidden = false;
    return;
  }

  if (emptyNode) emptyNode.hidden = true;

  visibleProjects.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'surface-panel project-card';
    card.setAttribute('data-reveal', '');
    card.setAttribute('data-pointer-glow', '');
    card.style.setProperty('--reveal-delay', `${Math.min(index * 45, 180)}ms`);

    const summary = project.summary?.[contentLang] || project.summary?.pt || '';
    const role = project.role?.[contentLang] || project.role?.pt || '';
    const noPublicLinksLabel = dict?.projects?.noPublicLinks || '';

    const head = document.createElement('div');
    head.className = 'project-head';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'project-title-wrap';

    const category = document.createElement('p');
    category.className = 'project-category';
    category.textContent = categoryLabel(project.category, dict);

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = project.name;

    titleWrap.append(category, title);

    const badge = document.createElement('span');
    badge.className = 'status-badge';
    badge.dataset.status = project.status;
    badge.textContent = statusLabel(project.status, dict);

    head.append(titleWrap, badge);

    const summaryNode = document.createElement('p');
    summaryNode.className = 'project-summary';
    summaryNode.textContent = summary;

    const roleNode = document.createElement('p');
    roleNode.className = 'project-role';
    if (role) {
      const rolePrefix = dict?.projects?.rolePrefix || '';
      roleNode.textContent = rolePrefix ? `${rolePrefix} ${role}` : role;
    } else {
      roleNode.hidden = true;
    }

    const stackList = createTagList(project.stack || [], 'project-stack');
    stackList.classList.add('hero-chip-list');

    const links = document.createElement('div');
    links.className = 'project-links';

    if (project.repoUrl) {
      const repoLink = document.createElement('a');
      repoLink.className = 'project-link';
      repoLink.href = project.repoUrl;
      repoLink.target = '_blank';
      repoLink.rel = 'noreferrer';
      repoLink.textContent = dict?.projects?.linkCode || 'Código';
      links.append(repoLink);
    }

    if (project.demoUrl) {
      const demoLink = document.createElement('a');
      demoLink.className = 'project-link';
      demoLink.href = project.demoUrl;
      demoLink.target = '_blank';
      demoLink.rel = 'noreferrer';
      demoLink.textContent = dict?.projects?.linkDemo || 'Demo';
      links.append(demoLink);
    }

    const note = document.createElement('p');
    note.className = 'project-note';
    if (!project.repoUrl && !project.demoUrl) {
      note.textContent = noPublicLinksLabel;
    } else {
      note.hidden = true;
    }

    card.append(head, summaryNode, roleNode, stackList, links, note);
    container.append(card);
  });
}

export function renderExperience({ container, items, lang, dict }) {
  if (!container) return;

  const contentLang = getContentLanguageKey(lang);
  container.innerHTML = '';

  items.forEach((item, index) => {
    const node = document.createElement('article');
    node.className = 'surface-panel timeline-item';
    node.setAttribute('data-reveal', '');
    node.style.setProperty('--reveal-delay', `${Math.min(index * 55, 220)}ms`);

    const meta = document.createElement('div');
    meta.className = 'timeline-meta';

    const period = document.createElement('span');
    period.className = 'timeline-period';
    period.textContent = item.period;

    const title = document.createElement('h3');
    title.className = 'timeline-title';
    title.textContent = item.title?.[contentLang] || item.title?.pt || '';

    meta.append(period, title);

    const description = document.createElement('p');
    description.className = 'timeline-description';
    description.textContent = item.description?.[contentLang] || item.description?.pt || '';

    const tags = Array.isArray(item.tags) ? item.tags : [];
    const tagsList = createTagList(tags, 'timeline-tags');
    if (!tags.length) {
      tagsList.hidden = true;
    }

    node.append(meta, description, tagsList);
    container.append(node);
  });
}
