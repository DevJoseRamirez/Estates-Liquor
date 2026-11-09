(function () {
  'use strict';

  /* ------------------------------
     CWC Collection Header
     Mobile description: clamped by CSS from first paint; the Load More
     button only appears when the text is actually cut off.
     ------------------------------ */

  const CLAMPED = 'cwc_collection-header__description--clamped';
  const mobile = window.matchMedia('(max-width: 768px)');

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcHeaderInit === 'true') return;
    sectionEl.dataset.cwcHeaderInit = 'true';

    const wrapper = sectionEl.querySelector('[data-description]');
    if (!wrapper) return;

    const text = wrapper.querySelector('[data-description-text]');
    const toggle = wrapper.querySelector('[data-description-toggle]');
    if (!text || !toggle) return;

    let expanded = false;

    function setLabel() {
      toggle.textContent = expanded ? toggle.dataset.labelLess : toggle.dataset.labelMore;
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    // Button shows only on mobile, and only when the clamp hides something
    function update() {
      if (!mobile.matches) {
        toggle.hidden = true;
        return;
      }
      if (expanded) {
        toggle.hidden = false;
        return;
      }
      wrapper.classList.add(CLAMPED);
      toggle.hidden = text.scrollHeight <= text.clientHeight + 1;
    }

    toggle.addEventListener('click', function () {
      expanded = !expanded;
      wrapper.classList.toggle(CLAMPED, !expanded);
      setLabel();

      // Collapsing from far down: bring the start of the text back into view
      if (!expanded && text.getBoundingClientRect().top < 0) {
        text.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });

    setLabel();
    update();

    if (mobile.addEventListener) {
      mobile.addEventListener('change', update);
    } else if (mobile.addListener) {
      mobile.addListener(update);
    }
    // Web fonts can change the line count after first paint
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(update);
    }
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_collection-header').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_collection-header');
    if (section) initSection(section);
  });
})();
