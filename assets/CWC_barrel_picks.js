(function () {
  'use strict';

  /* Quick add-to-cart for the barrel pick cards. Everything here is
     enhancement — with this file blocked the cards still link to the product
     page and sold-out cards are plain links either way. */

  /* The theme's cart drawer listens on the shared eventBus — re-render it with
     the new line, then open it. Returns false when nothing is listening (the
     store is set to cart page rather than drawer), so the caller can fall back
     to its own inline confirmation. Mirrors CWC_collection_body.js. */
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
    sectionEl.querySelectorAll('button.cwc_barrel-picks__card-button').forEach(function (button) {
      if (button.dataset.cwcBound === 'true') return;
      button.dataset.cwcBound = 'true';

      button.addEventListener('click', function () {
        var variantId = button.dataset.variantId;
        if (!variantId) return;

        button.classList.add('cwc_barrel-picks__card-button--loading');

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
            button.classList.remove('cwc_barrel-picks__card-button--loading');
            document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));

            /* the drawer is the confirmation — don't also flash the button */
            if (openCartDrawer()) return;

            button.classList.add('cwc_barrel-picks__card-button--added');
            window.setTimeout(function () {
              button.classList.remove('cwc_barrel-picks__card-button--added');
            }, 1600);
          })
          .catch(function () {
            button.classList.remove('cwc_barrel-picks__card-button--loading');
          });
      });
    });
  }

  /* The rail scrolls natively with scroll-snap, so this only drives the arrows
     and hides them when everything already fits. Mirrors CWC_rare_allocated. */
  function initCarousel(sectionEl) {
    var carousel = sectionEl.querySelector('[data-cwc-carousel]');
    if (!carousel) return;

    var track = carousel.querySelector('[data-cwc-track]');
    var prev = carousel.querySelector('[data-cwc-prev]');
    var next = carousel.querySelector('[data-cwc-next]');
    if (!track || !prev || !next) return;

    function update() {
      var overflow = track.scrollWidth - track.clientWidth;
      carousel.classList.toggle('cwc_barrel-picks__carousel--scrollable', overflow > 1);
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= overflow - 1;
    }

    /* one screenful, rounded to whole cards so nothing lands half-cut */
    function step() {
      var card = track.querySelector('.cwc_barrel-picks__card');
      if (!card) return track.clientWidth;

      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      var span = card.offsetWidth + gap;
      return Math.max(1, Math.floor(track.clientWidth / span)) * span;
    }

    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });

    next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcBarrelPicksInit === 'true') return;
    sectionEl.dataset.cwcBarrelPicksInit = 'true';

    bindAddToCart(sectionEl);
    initCarousel(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_barrel-picks').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_barrel-picks');
    if (section) initSection(section);
  });
})();
