(function () {
  'use strict';

  /* Enhancement only. With this file blocked the cards still work — every card
     links to its product page, and the quick-add button is the only control
     that needs JS. */

  /* The theme's cart drawer listens on the shared eventBus — re-render it with
     the new line, then open it. Returns false when nothing is listening (the
     store is set to cart page rather than drawer), so the caller can fall back
     to its own inline confirmation. Mirrors CWC_product_buy_box.js. */
  function openCartDrawer() {
    var bus = window.eventBus;
    var listeners = bus && bus.listeners && bus.listeners['open:cart:drawer'];
    if (!listeners || listeners.size === 0) return false;

    bus.emit('render:cart:drawer');
    bus.emit('open:cart:drawer', { scrollToTop: true });
    return true;
  }

  function bindAddToCart(sectionEl) {
    /* scoped to <button> — sold-out cards reuse the class on an <a> that just
       navigates to the product page */
    sectionEl.querySelectorAll('button.cwc_rare-allocated__card-button').forEach(function (button) {
      if (button.dataset.cwcBound === 'true') return;
      button.dataset.cwcBound = 'true';

      button.addEventListener('click', function () {
        var variantId = button.dataset.variantId;
        if (!variantId) return;

        button.classList.add('cwc_rare-allocated__card-button--loading');

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
            button.classList.remove('cwc_rare-allocated__card-button--loading');
            document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));

            /* the drawer is the confirmation — don't also flash the button */
            if (openCartDrawer()) return;

            button.classList.add('cwc_rare-allocated__card-button--added');
            window.setTimeout(function () {
              button.classList.remove('cwc_rare-allocated__card-button--added');
            }, 1600);
          })
          .catch(function () {
            button.classList.remove('cwc_rare-allocated__card-button--loading');
          });
      });
    });
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcRareAllocatedInit === 'true') return;
    sectionEl.dataset.cwcRareAllocatedInit = 'true';

    bindAddToCart(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_rare-allocated').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_rare-allocated');
    if (section) initSection(section);
  });
})();
