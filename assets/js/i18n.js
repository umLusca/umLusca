const STORAGE_KEY = 'lucas-portfolio-lang';
const SUPPORTED_LANGS = new Set(['pt-BR', 'en']);

function getByPath(source, path) {
  return path.split('.').reduce((acc, key) => (acc && key in acc ? acc[key] : undefined), source);
}

export function normalizeLanguage(lang) {
  return SUPPORTED_LANGS.has(lang) ? lang : 'pt-BR';
}

export function getStoredLanguage() {
  try {
    return normalizeLanguage(localStorage.getItem(STORAGE_KEY) || 'pt-BR');
  } catch {
    return 'pt-BR';
  }
}

export function storeLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, normalizeLanguage(lang));
  } catch {
    // Ignore storage issues in private mode or locked environments.
  }
}

export function getContentLanguageKey(lang) {
  return lang === 'en' ? 'en' : 'pt';
}

export function applyDictionary(dict, lang) {
  document.documentElement.lang = lang;

  const title = getByPath(dict, 'meta.title');
  const description = getByPath(dict, 'meta.description');

  if (typeof title === 'string') {
    document.title = title;
  }

  if (typeof description === 'string') {
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', description);
    }
  }

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (!key) return;

    const value = getByPath(dict, key);
    if (typeof value === 'string') {
      node.textContent = value;
    }
  });
}

export function initLanguageControls(initialLang, onChange) {
  const buttons = Array.from(document.querySelectorAll('[data-lang-btn]'));
  let currentLang = initialLang;

  const setActive = (lang) => {
    currentLang = normalizeLanguage(lang);
    buttons.forEach((button) => {
      const isActive = button.dataset.langBtn === currentLang;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextLang = normalizeLanguage(button.dataset.langBtn || 'pt-BR');
      if (nextLang === currentLang) return;
      onChange(nextLang);
    });
  });

  setActive(initialLang);
  return { setActive };
}
