(function () {
  'use strict';

  var STORAGE_PREFIX = 'cwc_announcement_dismissed_';

  function storageKey(sectionEl) {
    return STORAGE_PREFIX + (sectionEl.dataset.sectionId || 'default');
  }

  /* sessionStorage throws in some privacy modes — never let that break the bar */
  function isDismissed(sectionEl) {
    try {
      return window.sessionStorage.getItem(storageKey(sectionEl)) === '1';
    } catch (e) {
      return false;
    }
  }

  function rememberDismissed(sectionEl) {
    try {
      window.sessionStorage.setItem(storageKey(sectionEl), '1');
    } catch (e) {
      /* no-op */
    }
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcAnnouncementInit === 'true') return;

    var closeBtn = sectionEl.querySelector('.cwc_announcement__close');
    if (!closeBtn) return;

    sectionEl.dataset.cwcAnnouncementInit = 'true';

    /* In the Theme Editor always show the bar so merchants can keep editing it */
    var inThemeEditor = window.Shopify && window.Shopify.designMode;

    if (!inThemeEditor && isDismissed(sectionEl)) {
      sectionEl.classList.add('cwc_announcement--hidden');
      return;
    }

    closeBtn.addEventListener('click', function () {
      sectionEl.classList.add('cwc_announcement--hidden');
      rememberDismissed(sectionEl);
    });
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_announcement').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_announcement');
    if (section) initSection(section);
  });
})();
