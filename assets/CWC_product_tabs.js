(function () {
  'use strict';

  /* Tabs for sections/CWC_product_tabs.liquid. Add to cart is handled by
     CWC_product_card.js (one delegated listener on the document). */

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcProductTabsInit === 'true') return;
    sectionEl.dataset.cwcProductTabsInit = 'true';

    var tabs = Array.prototype.slice.call(sectionEl.querySelectorAll('.cwc_product-tabs__tab'));
    var panels = sectionEl.querySelectorAll('.cwc_product-tabs__panel');
    if (!tabs.length || !panels.length) return;

    function activate(index, focus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.classList.toggle('cwc_product-tabs__tab--active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach(function (panel, i) {
        var active = i === index;
        panel.classList.toggle('cwc_product-tabs__panel--active', active);
        panel.hidden = !active;
      });
      if (focus && tabs[index]) {
        tabs[index].focus();
        tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(index, false);
      });

      // Arrow / Home / End move between tabs (tablist pattern)
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next, true);
      });
    });

    sectionEl._cwcActivateTab = activate;
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_product-tabs').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: re-init on reload, and show the tab whose block is selected
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_product-tabs');
    if (section) initSection(section);
  });

  document.addEventListener('shopify:block:select', function (event) {
    var tab = event.target;
    if (!tab || !tab.classList || !tab.classList.contains('cwc_product-tabs__tab')) return;
    var section = tab.closest('.cwc_product-tabs');
    if (section && section._cwcActivateTab) {
      section._cwcActivateTab(parseInt(tab.dataset.index, 10) || 0, false);
    }
  });
})();
