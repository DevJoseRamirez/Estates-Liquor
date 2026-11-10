(function () {
  'use strict';

  function initSection(sectionEl) {
    if (!sectionEl || !sectionEl.classList.contains('cwc_home-hero--slideshow')) return;

    const track = sectionEl.querySelector('.cwc_home-hero__track');
    const slides = sectionEl.querySelectorAll('.cwc_home-hero__slide');
    const indicators = sectionEl.querySelectorAll('.cwc_home-hero__indicator');
    if (!track || slides.length < 2) return;

    // Clear any previous timer when re-initialised in the Theme Editor
    if (sectionEl._cwcHeroTimer) clearInterval(sectionEl._cwcHeroTimer);

    let current = 0;

    function setActive(index) {
      current = index;
      indicators.forEach(function (dot, i) {
        dot.classList.toggle('cwc_home-hero__indicator--active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    function goTo(index) {
      const target = slides[index];
      if (!target) return;
      track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
      setActive(index);
    }

    indicators.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.index, 10) || 0);
        restartAutoplay();
      });
    });

    // Keep indicators in sync with swipe / scroll
    let scrollTimeout;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        const index = Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth));
        if (index !== current) setActive(index);
      }, 80);
    }, { passive: true });

    // Autoplay
    const autoplay = sectionEl.dataset.autoplay === 'true';
    const speed = parseInt(sectionEl.dataset.speed, 10) || 6000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Paused while the pointer is over the hero, focus is inside it, or a
    // finger is on it, so autoplay never fights a swipe or trackpad gesture.
    let hovered = false;
    let focused = false;
    let touched = false;

    function startAutoplay() {
      // Always clear first: stacked intervals made slides jump on their own
      stopAutoplay();
      if (!autoplay || reduceMotion || hovered || focused || touched) return;
      sectionEl._cwcHeroTimer = setInterval(function () {
        goTo((current + 1) % slides.length);
      }, speed);
    }

    function stopAutoplay() {
      if (sectionEl._cwcHeroTimer) clearInterval(sectionEl._cwcHeroTimer);
      sectionEl._cwcHeroTimer = null;
    }

    function restartAutoplay() {
      startAutoplay();
    }

    sectionEl.addEventListener('mouseenter', function () {
      hovered = true;
      stopAutoplay();
    });
    sectionEl.addEventListener('mouseleave', function () {
      hovered = false;
      startAutoplay();
    });
    sectionEl.addEventListener('focusin', function () {
      focused = true;
      stopAutoplay();
    });
    sectionEl.addEventListener('focusout', function (event) {
      if (sectionEl.contains(event.relatedTarget)) return;
      focused = false;
      startAutoplay();
    });
    track.addEventListener('touchstart', function () {
      touched = true;
      stopAutoplay();
    }, { passive: true });

    setActive(0);
    startAutoplay();
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_home-hero').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_home-hero');
    if (section) initSection(section);
  });

  // Theme Editor: stop the old timer before the section is replaced
  document.addEventListener('shopify:section:unload', function (event) {
    const section = event.target.querySelector('.cwc_home-hero');
    if (section && section._cwcHeroTimer) clearInterval(section._cwcHeroTimer);
  });

  // Theme Editor: jump to the selected slide
  document.addEventListener('shopify:block:select', function (event) {
    const slide = event.target;
    if (!slide || !slide.classList.contains('cwc_home-hero__slide')) return;
    const track = slide.closest('.cwc_home-hero__track');
    if (track) track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  });
})();
