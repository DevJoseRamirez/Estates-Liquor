(function () {
  'use strict';

  const ACTIVE = 'cwc_announcement-bar__slide--active';

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcReady === 'true') return;

    const slides = Array.from(sectionEl.querySelectorAll('[data-cwc-announcement-slide]'));
    if (slides.length < 2) return;
    sectionEl.dataset.cwcReady = 'true';

    const prevBtn = sectionEl.querySelector('[data-cwc-announcement-prev]');
    const nextBtn = sectionEl.querySelector('[data-cwc-announcement-next]');
    const track = sectionEl.querySelector('.cwc_announcement-bar__track');
    const intervalMs = (parseInt(sectionEl.dataset.interval, 10) || 5) * 1000;
    const autoplay = sectionEl.dataset.autoplay === 'true';

    let current = 0;
    let timer = null;
    let paused = false;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        const isActive = i === current;
        slide.classList.toggle(ACTIVE, isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        const link = slide.querySelector('a');
        if (link) {
          if (isActive) link.removeAttribute('tabindex');
          else link.setAttribute('tabindex', '-1');
        }
      });
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (!autoplay || paused) return;
      timer = window.setInterval(function () {
        show(current + 1);
      }, intervalMs);
    }

    // Arrows hand control to the shopper: announce changes and restart the clock
    function step(direction) {
      if (track) track.setAttribute('aria-live', 'polite');
      show(current + direction);
      start();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

    function pause() {
      paused = true;
      stop();
    }

    function resume() {
      paused = false;
      start();
    }

    sectionEl.addEventListener('mouseenter', pause);
    sectionEl.addEventListener('mouseleave', resume);
    sectionEl.addEventListener('focusin', pause);
    sectionEl.addEventListener('focusout', function (event) {
      if (!sectionEl.contains(event.relatedTarget)) resume();
    });

    // Theme editor: jump to the announcement being edited and hold it there
    sectionEl.addEventListener('shopify:block:select', function (event) {
      const index = slides.indexOf(event.target.closest('[data-cwc-announcement-slide]'));
      if (index > -1) show(index);
      pause();
    });
    sectionEl.addEventListener('shopify:block:deselect', resume);

    start();
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_announcement-bar').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_announcement-bar');
    if (section) initSection(section);
  });
})();
