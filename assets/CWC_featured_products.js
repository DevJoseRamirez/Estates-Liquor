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

  function addToCart(variantId) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
    }).then(function (response) {
      if (!response.ok) throw new Error('Add to cart failed');
      return response.json();
    });
  }

  function initAddToCart(sectionEl) {
    var buttons = sectionEl.querySelectorAll('.cwc_featured-products__card-button');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var variantId = button.dataset.variantId;
        if (!variantId || button.disabled) return;

        button.classList.add('cwc_featured-products__card-button--loading');

        addToCart(variantId)
          .then(function () {
            button.classList.remove('cwc_featured-products__card-button--loading');
            button.classList.add('cwc_featured-products__card-button--added');

            /* let the theme's cart drawer / bubble refresh itself */
            document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));

            window.setTimeout(function () {
              button.classList.remove('cwc_featured-products__card-button--added');
            }, 1600);
          })
          .catch(function () {
            button.classList.remove('cwc_featured-products__card-button--loading');
          });
      });
    });
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcFeaturedProductsInit === 'true') return;
    sectionEl.dataset.cwcFeaturedProductsInit = 'true';

    initTabs(sectionEl);
    initAddToCart(sectionEl);
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
