(function () {
  'use strict';

  /* Enhancement only. The desktop dropdowns open on hover and :focus-within in
     CSS, and the drawer groups are <details> — so navigation still works with
     this file blocked. What is added here is the drawer itself and the live
     cart count. */

  function initDrawer(sectionEl) {
    var openButton = sectionEl.querySelector('[data-cwc-drawer-open]');
    if (!openButton) return;

    /* The drawer and overlay are siblings of the header, not children. */
    var root = sectionEl.parentNode;
    var drawer = root.querySelector('[data-cwc-drawer]');
    var overlay = root.querySelector('[data-cwc-drawer-overlay]');
    if (!drawer || !overlay) return;

    var closeButton = drawer.querySelector('[data-cwc-drawer-close]');
    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      drawer.removeAttribute('hidden');
      overlay.removeAttribute('hidden');
      /* next frame, so the transform transition actually runs */
      window.requestAnimationFrame(function () {
        drawer.classList.add('cwc_header__drawer--open');
      });
      openButton.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeButton) closeButton.focus();
    }

    function close() {
      drawer.classList.remove('cwc_header__drawer--open');
      overlay.setAttribute('hidden', '');
      openButton.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';

      /* wait out the slide before hiding, or it vanishes instantly */
      window.setTimeout(function () {
        drawer.setAttribute('hidden', '');
      }, 280);

      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    openButton.addEventListener('click', open);
    if (closeButton) closeButton.addEventListener('click', close);
    overlay.addEventListener('click', close);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !drawer.hasAttribute('hidden')) close();
    });

    /* A link tap should leave the drawer closed behind the new page. */
    drawer.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', close);
    });
  }

  /* The theme's own header opens its cart drawer by emitting on the shared
     eventBus (see Header.onCartButtonClick in theme.js); component-cart-drawer
     listens for it. Match that rather than reaching into the component. */
  function initCartDrawer(sectionEl) {
    var cartLink = sectionEl.querySelector('[data-cwc-cart-drawer]');
    if (!cartLink) return;

    cartLink.addEventListener('click', function (event) {
      var bus = window.eventBus;
      var listeners = bus && bus.listeners && bus.listeners['open:cart:drawer'];

      /* nothing listening yet — leave the click alone so it falls through to
         the cart page rather than doing nothing at all */
      if (!listeners || listeners.size === 0) return;

      event.preventDefault();
      bus.emit('open:cart:drawer', { scrollToTop: false });
    });
  }

  function initCartCount(sectionEl) {
    var count = sectionEl.querySelector('[data-cwc-cart-count]');
    if (!count) return;

    function refresh() {
      fetch('/cart.js')
        .then(function (response) {
          if (!response.ok) throw new Error('Cart read failed');
          return response.json();
        })
        .then(function (cart) {
          count.textContent = cart.item_count;
          if (cart.item_count > 0) {
            count.removeAttribute('hidden');
          } else {
            count.setAttribute('hidden', '');
          }
        })
        .catch(function () {
          /* leave the server-rendered count in place */
        });
    }

    /* every CWC section that adds to cart fires this */
    document.addEventListener('cwc:cart:added', refresh);
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcHeaderInit === 'true') return;
    sectionEl.dataset.cwcHeaderInit = 'true';

    initDrawer(sectionEl);
    initCartDrawer(sectionEl);
    initCartCount(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_header').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_header');
    if (section) initSection(section);
  });
})();
