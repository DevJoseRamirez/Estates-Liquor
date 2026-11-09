(function () {
  'use strict';

  function initTabs(sectionEl) {
    var tabs = sectionEl.querySelectorAll('.cwc_featured-products__tab');
    var panels = sectionEl.querySelectorAll('.cwc_featured-products__panel');
    if (!tabs.length || !panels.length) return;

    function activate(index) {
      tabs.forEach(function (tab, i) {
        var isActive = i === index;
        tab.classList.toggle('cwc_featured-products__tab--active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.forEach(function (panel, i) {
        var isActive = i === index;
        panel.classList.toggle('cwc_featured-products__panel--active', isActive);
        if (isActive) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(index);
      });

      /* arrow keys move between tabs, matching the tablist pattern */
      tab.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        var next =
          event.key === 'ArrowRight'
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;
        activate(next);
        tabs[next].focus();
      });
    });
  }

  /* Add to cart is handled by CWC_product_card.js (one delegated listener on
     the document) — the cards are the shared collection card. */

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcFeaturedProductsInit === 'true') return;
    sectionEl.dataset.cwcFeaturedProductsInit = 'true';

    initTabs(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_featured-products').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_featured-products');
    if (section) initSection(section);
  });
})();
