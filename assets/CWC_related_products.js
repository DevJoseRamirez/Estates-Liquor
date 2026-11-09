(function () {
  'use strict';

  /* Enhancement only. With a collection override the grid is already server
     rendered; this file only fetches Shopify's automatic recommendations. */

  /* Add to cart is handled by CWC_product_card.js (one delegated listener on
     the document), so cards fetched below work without re-binding. */

  /* The rail scrolls natively with scroll-snap, so this only drives the arrows
     and hides them when everything already fits. Safe to call again after the
     track element is swapped out — the arrow listeners bind once. */
  function initCarousel(sectionEl) {
    var carousel = sectionEl.querySelector('[data-cwc-carousel]');
    if (!carousel) return;

    var prev = carousel.querySelector('[data-cwc-prev]');
    var next = carousel.querySelector('[data-cwc-next]');
    if (!prev || !next) return;

    /* looked up per call, not cached — loadRecommendations replaces the node */
    function track() {
      return carousel.querySelector('[data-cwc-track]');
    }

    function update() {
      var el = track();
      if (!el) return;

      var overflow = el.scrollWidth - el.clientWidth;
      carousel.classList.toggle('cwc_related-products__carousel--scrollable', overflow > 1);
      prev.disabled = el.scrollLeft <= 1;
      next.disabled = el.scrollLeft >= overflow - 1;
    }

    /* one screenful, rounded to whole cards so nothing lands half-cut */
    function step() {
      var el = track();
      if (!el) return 0;

      var card = el.querySelector('.cwc_related-products__card');
      if (!card) return el.clientWidth;

      var gap = parseFloat(window.getComputedStyle(el).columnGap) || 0;
      var span = card.offsetWidth + gap;
      return Math.max(1, Math.floor(el.clientWidth / span)) * span;
    }

    function scrollBy(direction) {
      var el = track();
      if (el) el.scrollBy({ left: direction * step(), behavior: 'smooth' });
    }

    if (carousel.dataset.cwcCarouselBound !== 'true') {
      carousel.dataset.cwcCarouselBound = 'true';
      prev.addEventListener('click', function () { scrollBy(-1); });
      next.addEventListener('click', function () { scrollBy(1); });
      window.addEventListener('resize', update);
    }

    var current = track();
    if (current) current.addEventListener('scroll', update, { passive: true });
    update();
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
        initCarousel(sectionEl);
      })
      .catch(function () {
        sectionEl.remove();
      });
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcRelatedInit === 'true') return;
    sectionEl.dataset.cwcRelatedInit = 'true';

    initCarousel(sectionEl);
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
