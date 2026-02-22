import {
  applyDictionary,
  getContentLanguageKey,
  getStoredLanguage,
  initLanguageControls,
  normalizeLanguage,
  storeLanguage,
} from './i18n.js';
import { initHeroParallax, initPointerGlow, initScrollAnimations, refreshRevealTargets } from './animations.js';
import { initMetrics } from './metrics.js';
import { renderExperience, renderProjects } from './projects.js';

const DATA_PATHS = {
  profile: 'assets/data/profile.json',
  projects: 'assets/data/projects.json',
  experience: 'assets/data/experience.json',
  pt: 'assets/i18n/pt-BR.json',
  en: 'assets/i18n/en.json',
};

const state = {
  lang: 'pt-BR',
  profile: null,
  projects: [],
  experience: [],
  dicts: {},
  langControls: null,
};

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = byId(id);
  if (node) {
    node.textContent = value;
  }
}

function setHref(id, value) {
  const node = byId(id);
  if (node && value) {
    node.setAttribute('href', value);
  }
}

function renderHeroBadges(items) {
  const list = byId('hero-badges');
  if (!list) return;
  list.innerHTML = '';

  (items || []).forEach((item) => {
    const li = document.createElement('li');
    li.className = 'chip';
    li.textContent = item;
    list.append(li);
  });
}

function renderSkills(profile, lang) {
  const container = byId('skills-groups');
  if (!container) return;

  const key = getContentLanguageKey(lang);
  container.innerHTML = '';

  (profile.skills || []).forEach((group, index) => {
    const card = document.createElement('section');
    card.className = 'surface-panel skill-group';
    card.setAttribute('data-reveal', '');
    card.style.setProperty('--reveal-delay', `${Math.min(index * 45, 180)}ms`);

    const title = document.createElement('h3');
    title.textContent = group.label?.[key] || group.label?.pt || group.key;

    const tags = document.createElement('div');
    tags.className = 'skill-tags';

    (group.items || []).forEach((item) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = item;
      tags.append(tag);
    });

    card.append(title, tags);
    container.append(card);
  });
}

function renderProfileContent(profile, lang, dict) {
  const key = getContentLanguageKey(lang);
  const heroLogo = document.querySelector('.hero-logo');

  setText('hero-headline', profile.headline?.[key] || profile.headline?.pt || '');
  setText('hero-summary', profile.bioShort?.[key] || profile.bioShort?.pt || '');
  setText('about-intro', dict.about?.intro || '');
  setText('about-bio', profile.aboutPrimary?.[key] || profile.aboutPrimary?.pt || '');
  setText('about-focus', profile.aboutSecondary?.[key] || profile.aboutSecondary?.pt || '');
  setText('contact-intro', dict.contact?.intro || '');

  setText('started-at', String(profile.startedAt || 2020));

  const email = profile.contact?.email || '';
  const phoneDisplay = profile.contact?.phoneDisplay || '';
  const phoneIntl = profile.contact?.phoneIntl || '';
  const githubUrl = profile.contact?.github || 'https://github.com/umLusca';
  const githubHandle = githubUrl.replace(/^https?:\/\//, '');

  setText('contact-email-text', email);
  setText('contact-phone-text', phoneDisplay);
  setText('contact-github-text', githubHandle);

  setHref('contact-email-link', `mailto:${email}`);
  setHref('contact-phone-link', `tel:${phoneIntl}`);
  setHref('contact-whatsapp-link', `https://wa.me/${(profile.contact?.whatsapp || '').replace('+', '')}`);
  setHref('contact-github-link', githubUrl);
  setHref('projects-profile-link', githubUrl);

  if (heroLogo && profile.logoAsset) {
    heroLogo.src = profile.logoAsset;
  }

  renderHeroBadges(profile.heroBadges);
  renderSkills(profile, lang);
}

function renderApp() {
  if (!state.profile) return;

  const dict = state.dicts[state.lang];
  applyDictionary(dict, state.lang);
  renderProfileContent(state.profile, state.lang, dict);

  renderProjects({
    container: byId('projects-grid'),
    emptyNode: byId('projects-empty'),
    projects: state.projects,
    lang: state.lang,
    dict,
  });

  renderExperience({
    container: byId('experience-timeline'),
    items: state.experience,
    lang: state.lang,
    dict,
  });

  initPointerGlow(document);
  refreshRevealTargets(document);
  state.langControls?.setActive(state.lang);
}

function setupLanguageControls() {
  state.langControls = initLanguageControls(state.lang, (nextLang) => {
    const normalized = normalizeLanguage(nextLang);
    if (normalized === state.lang) return;
    state.lang = normalized;
    storeLanguage(normalized);
    renderApp();
  });
}

function showBootError(error) {
  console.error(error);

  const projectsContainer = byId('projects-grid');
  const empty = byId('projects-empty');

  if (projectsContainer) {
    projectsContainer.innerHTML = '';
  }

  if (empty) {
    empty.hidden = false;
    empty.textContent = 'Falha ao carregar os dados do portfólio. Use um servidor local ou publique no GitHub Pages para testar.';
  }
}

async function bootstrap() {
  try {
    state.lang = getStoredLanguage();

    const [profile, projects, experience, pt, en] = await Promise.all([
      fetchJson(DATA_PATHS.profile),
      fetchJson(DATA_PATHS.projects),
      fetchJson(DATA_PATHS.experience),
      fetchJson(DATA_PATHS.pt),
      fetchJson(DATA_PATHS.en),
    ]);

    state.profile = profile;
    state.projects = projects;
    state.experience = experience;
    state.dicts = {
      'pt-BR': pt,
      en,
    };

    setupLanguageControls();
    renderApp();
    initScrollAnimations();
    initHeroParallax();
    initMetrics(profile);
  } catch (error) {
    showBootError(error);
  }
}

bootstrap();
