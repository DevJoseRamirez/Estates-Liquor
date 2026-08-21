(function () {
  'use strict';

  /* Enhancement only — the track is a native scroll-snap slider and swipes
     fine with this file blocked. JS adds arrows, dots, and auto-advance. */
  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcHomeBannerInit === 'true') return;

    var track = sectionEl.querySelector('[data-cwc-banner-track]');
    if (!track) return;

    var slides = Array.prototype.slice.call(
      track.querySelectorAll('[data-cwc-banner-slide]')
    );
    if (slides.length === 0) return;

    sectionEl.dataset.cwcHomeBannerInit = 'true';

    var nav = sectionEl.querySelector('[data-cwc-banner-nav]');
    var prev = sectionEl.querySelector('[data-cwc-banner-prev]');
    var next = sectionEl.querySelector('[data-cwc-banner-next]');
    var dots = Array.prototype.slice.call(
      sectionEl.querySelectorAll('[data-cwc-banner-dot]')
    );

    var loop = sectionEl.dataset.loop === 'true';
    var autoplayEnabled = sectionEl.dataset.autoplay === 'true' && slides.length > 1;
    var autoplaySpeed = parseInt(sectionEl.dataset.autoplaySpeed, 10) || 5000;

    var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var current = 0;
    var timer = null;
    var paused = false;
    var scrollRaf = null;

    function slideWidth() {
      return track.clientWidth || 1;
    }

    function activeIndex() {
      var index = Math.round(track.scrollLeft / slideWidth());
      if (index < 0) index = 0;
      if (index > slides.length - 1) index = slides.length - 1;
      return index;
    }

    function syncUi(index) {
      current = index;

      dots.forEach(function (dot, i) {
        var isActive = i === index;
        dot.classList.toggle('cwc_home-banner__dot--active', isActive);
        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });

      if (prev) prev.disabled = !loop && index <= 0;
      if (next) next.disabled = !loop && index >= slides.length - 1;

      if (nav) {
        if (slides.length > 1) {
          nav.removeAttribute('hidden');
        } else {
          nav.setAttribute('hidden', '');
        }
      }
    }

    function goTo(index, smooth) {
      if (slides.length === 0) return;

      if (index < 0) {
        index = loop ? slides.length - 1 : 0;
      } else if (index > slides.length - 1) {
        index = loop ? 0 : slides.length - 1;
      }

      var behavior = smooth && !reduceMotionQuery.matches ? 'smooth' : 'auto';
      track.scrollTo({ left: index * slideWidth(), behavior: behavior });
      syncUi(index);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (!autoplayEnabled || paused || reduceMotionQuery.matches) return;
      if (document.hidden) return;

      timer = setInterval(function () {
        var nextIndex = current + 1;
        if (nextIndex > slides.length - 1) {
          if (!loop) {
            stopAutoplay();
            return;
          }
          nextIndex = 0;
        }
        goTo(nextIndex, true);
      }, autoplaySpeed);
    }

    function pause() {
      paused = true;
      stopAutoplay();
    }

    function resume() {
      paused = false;
      startAutoplay();
    }

    /* --- Events --- */
    if (prev) {
      prev.addEventListener('click', function () {
        goTo(current - 1, true);
        startAutoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        goTo(current + 1, true);
        startAutoplay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.dataset.slideIndex, 10) || 0;
        goTo(index, true);
        startAutoplay();
      });
    });

    track.addEventListener(
      'scroll',
      function () {
        if (scrollRaf) return;
        scrollRaf = window.requestAnimationFrame(function () {
          scrollRaf = null;
          var index = activeIndex();
          if (index !== current) syncUi(index);
        });
      },
      { passive: true }
    );

    sectionEl.addEventListener('mouseenter', pause);
    sectionEl.addEventListener('mouseleave', resume);
    sectionEl.addEventListener('focusin', pause);
    sectionEl.addEventListener('focusout', function (event) {
      if (!sectionEl.contains(event.relatedTarget)) resume();
    });
    track.addEventListener('pointerdown', pause);
    track.addEventListener('pointerup', resume);
    track.addEventListener('pointercancel', resume);

    /* Document/window listeners outlive a Theme Editor section reload, so they
       bail out once this instance is detached from the DOM. */
    document.addEventListener('visibilitychange', function () {
      if (!sectionEl.isConnected) {
        stopAutoplay();
        return;
      }
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    window.addEventListener('resize', function () {
      if (!sectionEl.isConnected) {
        stopAutoplay();
        return;
      }
      goTo(current, false);
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', startAutoplay);
    }

    syncUi(0);
    startAutoplay();
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_home-banner').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_home-banner');
    if (section) initSection(section);
  });

  // Theme Editor: Jump to the slide being edited
  document.addEventListener('shopify:block:select', function (event) {
    var slide = event.target.closest
      ? event.target.closest('[data-cwc-banner-slide]')
      : null;
    if (!slide) return;

    var section = slide.closest('.cwc_home-banner');
    if (!section) return;

    var track = section.querySelector('[data-cwc-banner-track]');
    if (!track) return;

    var index = parseInt(slide.dataset.slideIndex, 10) || 0;
    track.scrollTo({ left: index * (track.clientWidth || 1), behavior: 'smooth' });
  });
})();
