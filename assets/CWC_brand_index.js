(function () {
  'use strict';

  /* ------------------------------
     CWC Brand Index
     - Live brand search (accent-insensitive, batched per animation frame)
     - Sticky toolbar height feeds the letter anchors' scroll offset
     ------------------------------ */

  // "Pátron" and "patron" match the same query
  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcBrandIndexInit === 'true') return;
    sectionEl.dataset.cwcBrandIndexInit = 'true';

    initToolbarOffset(sectionEl);
    initSearch(sectionEl);
  }

  /* Anchored letter groups land just below the sticky toolbar */
  function initToolbarOffset(sectionEl) {
    const toolbar = sectionEl.querySelector('[data-brand-toolbar]');
    if (!toolbar || !sectionEl.classList.contains('cwc_brand-index--sticky-jump')) return;

    function update() {
      sectionEl.style.setProperty('--bi-toolbar-offset', toolbar.offsetHeight + 16 + 'px');
    }

    update();
    if ('ResizeObserver' in window) {
      new ResizeObserver(update).observe(toolbar);
    }
  }

  function initSearch(sectionEl) {
    const input = sectionEl.querySelector('[data-brand-search]');
    if (!input) return;

    const empty = sectionEl.querySelector('[data-brand-empty]');
    const status = sectionEl.querySelector('[data-brand-status]');
    const letterLinks = {};
    sectionEl.querySelectorAll('[data-jump-letter]').forEach(function (link) {
      letterLinks[link.dataset.jumpLetter] = link;
    });

    // Read the DOM once; every keystroke after that is plain array work
    const groups = Array.prototype.map.call(
      sectionEl.querySelectorAll('[data-brand-group]'),
      function (groupEl) {
        return {
          el: groupEl,
          letter: groupEl.dataset.brandGroup,
          visible: true,
          items: Array.prototype.map.call(
            groupEl.querySelectorAll('[data-brand-name]'),
            function (itemEl) {
              return { el: itemEl, name: normalize(itemEl.dataset.brandName), visible: true };
            }
          )
        };
      }
    );

    let frame = null;
    let lastQuery = '';

    function filter() {
      frame = null;
      const query = normalize(input.value);
      if (query === lastQuery) return;
      lastQuery = query;

      let total = 0;

      groups.forEach(function (group) {
        let groupCount = 0;
        group.items.forEach(function (item) {
          const match = !query || item.name.indexOf(query) !== -1;
          // Only touch the DOM when an item actually changes
          if (match !== item.visible) {
            item.visible = match;
            item.el.hidden = !match;
          }
          if (match) groupCount++;
        });

        const groupVisible = groupCount > 0;
        if (groupVisible !== group.visible) {
          group.visible = groupVisible;
          group.el.hidden = !groupVisible;
        }

        // Letters with no matching brands grey out while a search is active
        const link = letterLinks[group.letter];
        if (link) {
          link.classList.toggle('cwc_brand-index__jump-letter--filtered', !groupVisible);
          if (groupVisible) {
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
          } else {
            link.setAttribute('aria-disabled', 'true');
            link.setAttribute('tabindex', '-1');
          }
        }

        total += groupCount;
      });

      if (empty) empty.hidden = total > 0;
      if (status) {
        status.textContent = query ? total + (total === 1 ? ' brand found' : ' brands found') : '';
      }
    }

    input.addEventListener('input', function () {
      if (frame) return;
      frame = window.requestAnimationFrame(filter);
    });

    // Escape clears the search and shows every brand again
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && input.value) {
        event.preventDefault();
        input.value = '';
        filter();
      }
    });

    // Enter with a single match goes straight to that brand
    input.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (!lastQuery) return;
      const matches = [];
      groups.forEach(function (group) {
        group.items.forEach(function (item) {
          if (item.visible) matches.push(item);
        });
      });
      if (matches.length === 1) {
        const link = matches[0].el.querySelector('a');
        if (link) window.location.href = link.href;
      }
    });

    // Restored back/forward-cache pages keep the typed value
    if (input.value) filter();
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_brand-index').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_brand-index');
    if (section) initSection(section);
  });
})();
