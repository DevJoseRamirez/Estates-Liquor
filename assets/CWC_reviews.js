(function () {
  'use strict';

  var RUNNING_CLASS = 'cwc_reviews__carousel--running';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* === Carousel: seamless auto-scroll loop ===
     The track holds two identical halves; the animation slides it by -50%,
     so the second half lands exactly where the first began. Each half
     repeats the set enough times to cover the visible width.
     Without JS (or with reduced motion) the carousel is a native swipe row. */
  function initSection(sectionEl) {
    if (!sectionEl) return;
    var carousel = sectionEl.querySelector('.cwc_reviews__carousel');
    if (!carousel || carousel.dataset.cwcReady) return;
    var track = carousel.querySelector('.cwc_reviews__track');
    var set = track && track.querySelector('.cwc_reviews__set');
    if (!set) return;
    carousel.dataset.cwcReady = 'true';

    var speed = parseFloat(carousel.dataset.speed) || 40;
    var lastWidth = 0;

    function cloneSet() {
      var clone = set.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('inert', '');
      clone.querySelectorAll('[data-shopify-editor-block]').forEach(function (el) {
        el.removeAttribute('data-shopify-editor-block');
      });
      return clone;
    }

    function build() {
      track.querySelectorAll('.cwc_reviews__set[aria-hidden]').forEach(function (el) {
        el.remove();
      });
      carousel.classList.remove(RUNNING_CLASS);
      if (reduceMotion.matches) return;

      var setWidth = set.offsetWidth;
      var viewWidth = carousel.offsetWidth;
      if (!setWidth || !viewWidth) return;

      var copies = Math.max(1, Math.ceil(viewWidth / setWidth));
      // First half: original + (copies - 1) clones; second half: copies clones
      for (var i = 1; i < copies * 2; i++) {
        track.appendChild(cloneSet());
      }

      var duration = (setWidth * copies) / speed;
      carousel.style.setProperty('--rv-marquee-duration', duration + 's');
      carousel.scrollLeft = 0;
      carousel.classList.add(RUNNING_CLASS);
      lastWidth = viewWidth;
    }

    build();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (carousel.offsetWidth !== lastWidth) build();
      }, 200);
    });

    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', build);
    }
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_reviews').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_reviews');
    if (section) initSection(section);
  });
})();
