(function () {
  'use strict';

  /* Enhancement only. With a collection override the grid is already server
     rendered; this file only fetches Shopify's automatic recommendations. */

  function bindAddToCart(sectionEl) {
    sectionEl.querySelectorAll('.cwc_related-products__card-button').forEach(function (button) {
      if (button.dataset.cwcBound === 'true') return;
      button.dataset.cwcBound = 'true';

      button.addEventListener('click', function () {
        var variantId = button.dataset.variantId;
        if (!variantId) return;

        button.classList.add('cwc_related-products__card-button--loading');

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
        })
          .then(function (response) {
            if (!response.ok) throw new Error('Add to cart failed');
            return response.json();
          })
          .then(function () {
            button.classList.remove('cwc_related-products__card-button--loading');
            button.classList.add('cwc_related-products__card-button--added');
            document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));
            window.setTimeout(function () {
              button.classList.remove('cwc_related-products__card-button--added');
            }, 1600);
          })
          .catch(function () {
            button.classList.remove('cwc_related-products__card-button--loading');
          });
      });
    });
  }

  function loadRecommendations(sectionEl) {
    var slot = sectionEl.querySelector('[data-cwc-recommendations]');
    if (!slot) return;

    var url = slot.dataset.url;
    if (!url) return;

    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('Recommendations failed');
        return response.text();
      })
      .then(function (html) {
        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var grid = parsed.querySelector('[data-cwc-grid]');

        /* Nothing came back — drop the whole section rather than leave a
           heading over an empty row. */
        if (!grid || !grid.children.length) {
          sectionEl.remove();
          return;
        }

        slot.replaceWith(grid);
        bindAddToCart(sectionEl);
      })
      .catch(function () {
        sectionEl.remove();
      });
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcRelatedInit === 'true') return;
    sectionEl.dataset.cwcRelatedInit = 'true';

    bindAddToCart(sectionEl);
    loadRecommendations(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_related-products').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_related-products');
    if (section) initSection(section);
  });
})();
