(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const compact = window.matchMedia('(max-width: 1000px)');
  document.documentElement.classList.add('js');

  const closeMenu = (restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.hidden = compact.matches;
    if (restoreFocus) toggle.focus();
  };
  const syncMenu = () => {
    toggle.hidden = !compact.matches;
    // Do not leave keyboard focus inside the navigation when it collapses.
    closeMenu(compact.matches && nav.contains(document.activeElement));
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.hidden = !open;
  });
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !compact.matches) return;
    closeMenu();
    const section = link.hash ? document.getElementById(link.hash.slice(1)) : null;
    if (section) {
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  compact.addEventListener('change', syncMenu);
  syncMenu();

  // Preserve existing root deep links to the interactive analytics modules.
  const legacyHashes = new Set(['#pulse', '#experience']);
  const followLegacyLink = () => {
    if (legacyHashes.has(window.location.hash)) window.location.replace('/analytics/' + window.location.hash);
  };
  window.addEventListener('hashchange', followLegacyLink);
  followLegacyLink();
})();
