(function () {
  'use strict';

  /* Carousel arrows for the barrel pick rail. Enhancement only — the rail
     scrolls natively without it. */

  /* Add to cart is handled by CWC_product_card.js (one delegated listener on
     the document) — the cards are the shared collection card. */

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
