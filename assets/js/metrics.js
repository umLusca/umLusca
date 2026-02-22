function bindMetricImage(imgId, src, alt) {
  const img = document.getElementById(imgId);
  if (!img) return;

  const container = img.closest('[data-metric-container]');
  const fallback = container?.querySelector('.metric-fallback');

  img.onerror = () => {
    img.hidden = true;
    if (fallback) fallback.hidden = false;
    container?.classList.add('is-fallback');
  };

  img.onload = () => {
    img.hidden = false;
    if (fallback) fallback.hidden = true;
    container?.classList.remove('is-fallback');
  };

  if (alt) img.alt = alt;
  img.src = src;
}

export function initMetrics(profile) {
  const metrics = profile.metrics || {};

  const setLink = (id, href) => {
    const node = document.getElementById(id);
    if (!node || !href) return;
    node.href = href;
  };

  setLink('metrics-waka-link', metrics.wakatimeProfileUrl);
  setLink('metrics-codetime-link', metrics.codeTimeProjectUrl || 'https://codetime.dev');
  setLink('metrics-github-link', profile.contact?.github);
  setLink('metrics-github-langs-link', profile.contact?.github);

  if (metrics.wakatimeBadge) {
    bindMetricImage('metrics-waka-badge', metrics.wakatimeBadge, 'WakaTime badge');
  }
  if (metrics.codeTimeBadge) {
    bindMetricImage('metrics-codetime-badge', metrics.codeTimeBadge, 'CodeTime badge');
  }
  if (metrics.githubStats) {
    bindMetricImage('metrics-github-stats', metrics.githubStats, 'GitHub stats');
  }
  if (metrics.githubTopLangs) {
    bindMetricImage('metrics-github-langs', metrics.githubTopLangs, 'Top languages');
  }
}
