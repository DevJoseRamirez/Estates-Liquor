(function () {
  'use strict';

  var RUNNING_CLASS = 'cwc_store-reviews__carousel--running';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // How long the auto-cycle waits after a visitor swipes, scrolls or clicks
  var RESUME_DELAY = 6000;

  function initSection(sectionEl) {
    if (!sectionEl) return;
    var carousel = sectionEl.querySelector('.cwc_store-reviews__carousel');
    if (!carousel || carousel.dataset.cwcReady) return;
    var track = carousel.querySelector('.cwc_store-reviews__track');
    var set = track && track.querySelector('.cwc_store-reviews__set');
    if (!set) return;
    carousel.dataset.cwcReady = 'true';

    var mode = carousel.dataset.mode || 'cycle';
    if (mode === 'marquee') {
      initMarquee(carousel, track, set);
    } else {
      initStepper(sectionEl, carousel, set, mode === 'cycle');
    }
  }

  /* === Continuous scroll: seamless auto-scroll loop ===
     The track holds two identical halves; the animation slides it by -50%,
     so the second half lands exactly where the first began. Each half
     repeats the set enough times to cover the visible width.
     Without JS (or with reduced motion) the carousel is a native swipe row. */
  function initMarquee(carousel, track, set) {
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
      track.querySelectorAll('.cwc_store-reviews__set[aria-hidden]').forEach(function (el) {
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
      carousel.style.setProperty('--sr-marquee-duration', duration + 's');
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

  /* === Auto-cycle / manual: native scroll-snap row ===
     The row stays a real scroller, so swipe, trackpad and keyboard all work.
     Auto-cycle steps one card at a time and wraps to the start at the end.
     It pauses while hovered or focused, while off-screen or in a background
     tab, and for a few seconds after any visitor interaction. */
  function initStepper(sectionEl, carousel, set, autoplay) {
    var nav = sectionEl.querySelector('.cwc_store-reviews__nav');
    var interval = (parseFloat(carousel.dataset.interval) || 5) * 1000;
    var timer = null;
    var resumeTimer = null;
    var hovered = false;
    var focused = false;
    var userPaused = false;
    var inView = true;

    function behavior() {
      return reduceMotion.matches ? 'auto' : 'smooth';
    }

    function stepSize() {
      var card = set.querySelector('.cwc_store-reviews__card');
      if (!card) return carousel.clientWidth;
      var gap = parseFloat(window.getComputedStyle(set).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function maxScroll() {
      return carousel.scrollWidth - carousel.clientWidth;
    }

    function go(direction) {
      var max = maxScroll();
      if (max <= 1) return;
      var left = carousel.scrollLeft;
      var target;
      if (direction > 0) {
        target = left >= max - 4 ? 0 : Math.min(left + stepSize(), max);
      } else {
        target = left <= 4 ? max : Math.max(left - stepSize(), 0);
      }
      carousel.scrollTo({ left: target, behavior: behavior() });
    }

    function canRun() {
      return autoplay && !reduceMotion.matches && !hovered && !focused && !userPaused && inView && !document.hidden && maxScroll() > 1;
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    function update() {
      if (canRun()) {
        if (!timer) timer = setInterval(function () { go(1); }, interval);
      } else {
        stop();
      }
    }

    // Any deliberate interaction pauses the cycle, then it picks up again
    function pauseForUser() {
      userPaused = true;
      update();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () {
        userPaused = false;
        update();
      }, RESUME_DELAY);
    }

    function refreshNav() {
      if (nav) nav.hidden = maxScroll() <= 1;
      update();
    }

    if (nav) {
      nav.querySelectorAll('.cwc_store-reviews__nav-button').forEach(function (button) {
        button.addEventListener('click', function () {
          pauseForUser();
          go(button.dataset.direction === 'prev' ? -1 : 1);
        });
      });
    }

    carousel.addEventListener('mouseenter', function () { hovered = true; update(); });
    carousel.addEventListener('mouseleave', function () { hovered = false; update(); });
    carousel.addEventListener('focusin', function () { focused = true; update(); });
    carousel.addEventListener('focusout', function () { focused = false; update(); });
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (type) {
      carousel.addEventListener(type, pauseForUser, { passive: true });
    });

    // Arrow keys move one card when the row has focus
    carousel.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      go(event.key === 'ArrowRight' ? 1 : -1);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        update();
      }).observe(carousel);
    }

    document.addEventListener('visibilitychange', update);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', update);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshNav, 200);
    });

    sectionEl._cwcReviewsStop = stop;
    refreshNav();
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

  document.addEventListener('shopify:section:unload', function (event) {
    var section = event.target.querySelector('.cwc_store-reviews');
    if (section && section._cwcReviewsStop) section._cwcReviewsStop();
  });
})();
