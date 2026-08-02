(function () {
  'use strict';

  /* The product form posts to /cart/add on its own, so with this file blocked
     the buy box still adds to cart via a normal form submit. */

  function moneyFormat(cents) {
    var format = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD';
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
        style: 'currency',
        currency: format
      }).format(cents / 100);
    } catch (e) {
      return '$' + (cents / 100).toFixed(2);
    }
  }

  function addItems(items) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items })
    }).then(function (response) {
      if (!response.ok) throw new Error('Add to cart failed');
      return response.json();
    });
  }

  function initGallery(sectionEl) {
    var main = sectionEl.querySelector('[data-cwc-media-image]');
    var thumbs = sectionEl.querySelectorAll('[data-cwc-thumb]');
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var full = thumb.dataset.full;
        if (full) main.src = full;
        thumbs.forEach(function (t) {
          t.classList.remove('cwc_product-buy-box__thumb--active');
        });
        thumb.classList.add('cwc_product-buy-box__thumb--active');
      });
    });
  }

  function initQuantity(sectionEl) {
    var input = sectionEl.querySelector('[data-cwc-qty-input]');
    if (!input) return;

    sectionEl.querySelectorAll('[data-cwc-qty]').forEach(function (button) {
      button.addEventListener('click', function () {
        var step = parseInt(button.dataset.cwcQty, 10) || 0;
        var next = (parseInt(input.value, 10) || 1) + step;
        input.value = next < 1 ? 1 : next;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function initVariantSelect(sectionEl) {
    var select = sectionEl.querySelector('[data-cwc-variant-select]');
    if (!select) return;

    /* Keep the URL in step with the chosen variant so a refresh or a share
       lands on the same one. */
    select.addEventListener('change', function () {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', select.value);
      window.history.replaceState({}, '', url.toString());
    });
  }

  function initAddToCart(sectionEl) {
    var form = sectionEl.querySelector('form[action*="/cart/add"]');
    var button = sectionEl.querySelector('[data-cwc-atc]');
    if (!form || !button) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var variantField = form.querySelector('[name="id"]');
      var qtyField = form.querySelector('[name="quantity"]');
      if (!variantField) return;

      var original = button.textContent;
      button.classList.add('cwc_product-buy-box__atc--loading');

      addItems([
        {
          id: variantField.value,
          quantity: parseInt(qtyField ? qtyField.value : 1, 10) || 1
        }
      ])
        .then(function () {
          button.classList.remove('cwc_product-buy-box__atc--loading');
          button.textContent = 'Added';
          document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));
          window.setTimeout(function () {
            button.textContent = original;
          }, 1600);
        })
        .catch(function () {
          /* fall back to a real form post so the shopper is never stuck */
          button.classList.remove('cwc_product-buy-box__atc--loading');
          form.submit();
        });
    });
  }

  function initFbt(sectionEl) {
    var fbt = sectionEl.querySelector('[data-cwc-fbt]');
    if (!fbt) return;

    var totalEl = fbt.querySelector('[data-cwc-fbt-total]');
    var addButton = fbt.querySelector('[data-cwc-fbt-add]');
    var self = fbt.querySelector('[data-cwc-fbt-self]');
    var checks = fbt.querySelectorAll('[data-cwc-fbt-check]');
    if (!totalEl || !addButton) return;

    function selected() {
      var items = [];
      if (self) {
        items.push({ id: self.dataset.variantId, price: parseInt(self.dataset.price, 10) || 0 });
      }
      checks.forEach(function (check) {
        if (check.checked && !check.disabled) {
          items.push({ id: check.dataset.variantId, price: parseInt(check.dataset.price, 10) || 0 });
        }
      });
      return items;
    }

    function syncTotal() {
      var items = selected();
      var sum = items.reduce(function (acc, item) {
        return acc + item.price;
      }, 0);
      totalEl.textContent = moneyFormat(sum);
      addButton.disabled = items.length === 0;
    }

    checks.forEach(function (check) {
      check.addEventListener('change', syncTotal);
    });

    addButton.addEventListener('click', function () {
      var items = selected().map(function (item) {
        return { id: item.id, quantity: 1 };
      });
      if (!items.length) return;

      var original = addButton.textContent;
      addButton.disabled = true;

      addItems(items)
        .then(function () {
          addButton.textContent = 'Added';
          document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));
          window.setTimeout(function () {
            addButton.textContent = original;
            addButton.disabled = false;
          }, 1600);
        })
        .catch(function () {
          addButton.textContent = original;
          addButton.disabled = false;
        });
    });

    syncTotal();
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcBuyBoxInit === 'true') return;
    sectionEl.dataset.cwcBuyBoxInit = 'true';

    initGallery(sectionEl);
    initQuantity(sectionEl);
    initVariantSelect(sectionEl);
    initAddToCart(sectionEl);
    initFbt(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_product-buy-box').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_product-buy-box');
    if (section) initSection(section);
  });
})();
