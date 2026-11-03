(function () {
  'use strict';

  /* Add to cart for snippets/cwc-product-card.liquid.
     One delegated listener on the document, so cards that arrive later (Load
     More, AJAX filtering) work without re-binding. Loaded by every section that
     renders the card; the guard keeps it to a single listener. */
  if (window.cwcProductCardInit) return;
  window.cwcProductCardInit = true;

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

  document.addEventListener('click', function (event) {
    /* scoped to <button> — sold-out cards reuse the class on an <a> that just
       navigates to the product page */
    var button = event.target.closest('button.cwc_collection-body__card-button');
    if (!button) return;

    var variantId = button.dataset.variantId;
    if (!variantId || button.classList.contains('cwc_collection-body__card-button--loading')) return;

    button.classList.add('cwc_collection-body__card-button--loading');

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
        button.classList.remove('cwc_collection-body__card-button--loading');
        document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));

        /* the drawer is the confirmation — don't also flash the button */
        if (openCartDrawer()) return;

        button.classList.add('cwc_collection-body__card-button--added');
        window.setTimeout(function () {
          button.classList.remove('cwc_collection-body__card-button--added');
        }, 1600);
      })
      .catch(function () {
        button.classList.remove('cwc_collection-body__card-button--loading');
      });
  });
})();
