(function () {
  'use strict';

  /* Enhancement only. Without this file the description simply renders
     unclamped and the sticky bar stays hidden — nothing breaks. */

  function initClamp(sectionEl) {
    var wrap = sectionEl.querySelector('[data-cwc-clamp-wrap]');
    var toggle = sectionEl.querySelector('[data-cwc-clamp-toggle]');
    if (!wrap || !toggle) return;

    var rte = wrap.querySelector('.cwc_product-details__rte');
    if (!rte) return;

    /* If the copy is short enough to fit, drop the clamp and the button
       rather than showing a Read More that does nothing. */
    if (rte.scrollHeight <= rte.clientHeight + 4) {
      wrap.classList.remove('cwc_product-details__body--clamped');
      toggle.remove();
      return;
    }

    toggle.addEventListener('click', function () {
      var clamped = wrap.classList.toggle('cwc_product-details__body--clamped');
      toggle.textContent = clamped ? toggle.dataset.more : toggle.dataset.less;
      toggle.setAttribute('aria-expanded', clamped ? 'false' : 'true');
    });
  }

  function initSticky(sectionEl) {
    var bar = sectionEl.querySelector('[data-cwc-sticky-atc]');
    if (!bar) return;

    var selector = bar.dataset.watch || '[data-cwc-atc]';
    var watched = document.querySelector(selector);

    /* Nothing to watch (no buy box on this template) — leave the bar off
       rather than showing a duplicate cart control with no context. */
    if (!watched || !('IntersectionObserver' in window)) return;

    bar.removeAttribute('hidden');

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          bar.classList.toggle('cwc_product-details__sticky--visible', !entry.isIntersecting);
        });
      },
      { rootMargin: '0px 0px -20px 0px', threshold: 0 }
    );

    observer.observe(watched);

    var form = bar.querySelector('form[action*="/cart/add"]');
    var button = bar.querySelector('[data-cwc-sticky-add]');
    if (!form || !button) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var variantField = form.querySelector('[name="id"]');
      if (!variantField) return;

      var original = button.textContent;
      button.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantField.value, quantity: 1 }] })
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Add to cart failed');
          return response.json();
        })
        .then(function () {
          button.textContent = 'Added';
          button.disabled = false;
          document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));
          window.setTimeout(function () {
            button.textContent = original;
          }, 1600);
        })
        .catch(function () {
          button.disabled = false;
          form.submit();
        });
    });
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcProductDetailsInit === 'true') return;
    sectionEl.dataset.cwcProductDetailsInit = 'true';

    initClamp(sectionEl);
    initSticky(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_product-details').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_product-details');
    if (section) initSection(section);
  });
})();
