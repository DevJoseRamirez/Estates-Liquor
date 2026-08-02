(function () {
  'use strict';

  /* Enhancement only — the track is a native scroll-snap carousel and
     swipes fine with this file blocked. */
  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcStoreReviewsInit === 'true') return;

    var track = sectionEl.querySelector('.cwc_store-reviews__track');
    var nav = sectionEl.querySelector('[data-cwc-reviews-nav]');
    if (!track || !nav) return;

    var prev = nav.querySelector('[data-cwc-reviews-prev]');
    var next = nav.querySelector('[data-cwc-reviews-next]');
    if (!prev || !next) return;

    sectionEl.dataset.cwcStoreReviewsInit = 'true';

    function overflows() {
      return track.scrollWidth - track.clientWidth > 2;
    }

    function syncNav() {
      if (!overflows()) {
        nav.setAttribute('hidden', '');
        return;
      }
      nav.removeAttribute('hidden');

      var maxScroll = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll - 2;
    }

    function page(direction) {
      var card = track.querySelector('.cwc_store-reviews__card');
      var step = card ? card.offsetWidth + 16 : track.clientWidth;
      track.scrollBy({ left: step * direction, behavior: 'smooth' });
    }

    prev.addEventListener('click', function () {
      page(-1);
    });
    next.addEventListener('click', function () {
      page(1);
    });
    track.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav);

    syncNav();
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_store-reviews').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_store-reviews');
    if (section) initSection(section);
  });
})();
