(function () {
  'use strict';

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcReady === 'true') return;
    sectionEl.dataset.cwcReady = 'true';

    const button = sectionEl.querySelector('[data-back-to-top]');
    if (!button) return;

    button.addEventListener('click', function () {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

      // Move keyboard focus back to the top of the page too, without jumping the scroll
      const main = document.getElementById('MainContent');
      if (main) {
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
    });
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_back-to-top').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_back-to-top');
    if (section) initSection(section);
  });
})();
