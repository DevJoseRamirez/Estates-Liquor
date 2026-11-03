(function () {
  'use strict';

  /* Read More / Read Less. The collapse rule lives in the section's style block;
     this only toggles the class. Without JS the full copy shows and the button
     stays hidden. */
  function initSection(sectionEl) {
    if (!sectionEl) return;

    var body = sectionEl.querySelector('[data-cwc-seo-body]');
    var toggle = sectionEl.querySelector('.cwc_collection-seo__toggle');
    if (!body || !toggle) return;

    body.classList.add('cwc_collection-seo--collapsed');

    /* Copy short enough to fit → no button */
    var candidates = body.querySelectorAll(
      ':scope > .cwc_collection-seo__card, .cwc_collection-seo__card--metafield .cwc_collection-seo__card-text > *'
    );
    var anyHidden = Array.prototype.some.call(candidates, function (el) {
      return window.getComputedStyle(el).display === 'none';
    });

    if (!anyHidden) {
      body.classList.remove('cwc_collection-seo--collapsed');
      toggle.hidden = true;
      return;
    }

    toggle.hidden = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = toggle.dataset.more;

    if (toggle.dataset.cwcInit === 'true') return;
    toggle.dataset.cwcInit = 'true';

    toggle.addEventListener('click', function () {
      var collapsed = body.classList.toggle('cwc_collection-seo--collapsed');
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.textContent = collapsed ? toggle.dataset.more : toggle.dataset.less;
    });
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_collection-seo').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_collection-seo');
    if (section) initSection(section);
  });
})();
