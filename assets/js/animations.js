let revealObserver;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setVisible(node) {
  node.classList.add('is-visible');
}

export function initScrollAnimations() {
  const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));

  revealTargets.forEach((node) => {
    const delay = node.getAttribute('data-reveal-delay');
    if (delay && !node.style.getPropertyValue('--reveal-delay')) {
      node.style.setProperty('--reveal-delay', `${delay}ms`);
    }
  });

  if (prefersReducedMotion()) {
    revealTargets.forEach(setVisible);
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setVisible(entry.target);
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      },
    );
  }

  revealTargets.forEach((node) => {
    if (node.classList.contains('is-visible')) return;
    revealObserver.observe(node);
  });
}

export function refreshRevealTargets(root = document) {
  const revealTargets = Array.from(root.querySelectorAll('[data-reveal]'));

  if (prefersReducedMotion()) {
    revealTargets.forEach(setVisible);
    return;
  }

  revealTargets.forEach((node) => {
    const delay = node.getAttribute('data-reveal-delay');
    if (delay && !node.style.getPropertyValue('--reveal-delay')) {
      node.style.setProperty('--reveal-delay', `${delay}ms`);
    }
    if (node.classList.contains('is-visible')) return;
    revealObserver?.observe(node);
  });
}

export function initPointerGlow(root = document) {
  const targets = root.querySelectorAll('[data-pointer-glow]');

  targets.forEach((node) => {
    if (node.dataset.pointerGlowBound === 'true') return;

    node.dataset.pointerGlowBound = 'true';
    node.addEventListener('pointermove', (event) => {
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      node.style.setProperty('--mx', `${x}%`);
      node.style.setProperty('--my', `${y}%`);
    });
  });
}

export function initHeroParallax() {
  const heroVisual = document.getElementById('hero-visual');
  if (!heroVisual || prefersReducedMotion()) return;

  let rafId = 0;
  let targetX = 0;
  let targetY = 0;

  const applyTilt = () => {
    heroVisual.style.setProperty('--hero-tilt-x', `${targetY.toFixed(2)}deg`);
    heroVisual.style.setProperty('--hero-tilt-y', `${targetX.toFixed(2)}deg`);
    rafId = 0;
  };

  heroVisual.addEventListener('pointermove', (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    targetX = px * 3.5;
    targetY = -py * 3.5;
    if (!rafId) rafId = window.requestAnimationFrame(applyTilt);
  });

  heroVisual.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
    if (!rafId) rafId = window.requestAnimationFrame(applyTilt);
  });
}
