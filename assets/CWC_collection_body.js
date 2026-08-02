(function () {
  'use strict';

  /* Everything here is enhancement. With this file blocked the section still
     works: filter groups are <details>, the form has an Apply button, sort has
     a Go button, and Load More is a plain link to page 2. */

  function initSheets(sectionEl) {
    var overlay = sectionEl.querySelector('[data-cwc-overlay]');
    var sheets = sectionEl.querySelectorAll('[data-cwc-sheet]');
    if (!overlay || !sheets.length) return;

    function closeAll() {
      sheets.forEach(function (sheet) {
        sheet.removeAttribute('data-cwc-open');
      });
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }

    function open(name) {
      var sheet = sectionEl.querySelector('[data-cwc-sheet="' + name + '"]');
      if (!sheet) return;
      closeAll();
      sheet.setAttribute('data-cwc-open', 'true');
      overlay.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';

      var close = sheet.querySelector('[data-cwc-close]');
      if (close) close.focus();
    }

    sectionEl.querySelectorAll('[data-cwc-open]').forEach(function (button) {
      if (button.hasAttribute('data-cwc-sheet')) return;
      button.addEventListener('click', function () {
        open(button.getAttribute('data-cwc-open'));
      });
    });

    sectionEl.querySelectorAll('[data-cwc-close]').forEach(function (button) {
      button.addEventListener('click', closeAll);
    });

    overlay.addEventListener('click', closeAll);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAll();
    });
  }

  function initAutoSubmit(sectionEl) {
    var filterForm = sectionEl.querySelector('[data-cwc-filter-form]');
    var sortForm = sectionEl.querySelector('[data-cwc-sort-form]');

    /* Only auto-submit on desktop — on a bottom sheet, reloading on every tap
       would close the sheet after a single choice. */
    function isSheetLayout() {
      return window.matchMedia('(max-width: 1024px)').matches;
    }

    if (filterForm) {
      filterForm.addEventListener('change', function (event) {
        if (isSheetLayout()) return;
        if (event.target.type === 'number') return;
        filterForm.submit();
      });
    }

    if (sortForm) {
      var select = sortForm.querySelector('select');
      if (select) {
        select.addEventListener('change', function () {
          sortForm.submit();
        });
      }
    }
  }

  function initLoadMore(sectionEl) {
    var button = sectionEl.querySelector('[data-cwc-load-more]');
    var grid = sectionEl.querySelector('[data-cwc-grid]');
    if (!button || !grid) return;

    var progress = sectionEl.querySelector('[data-cwc-load-progress]');
    var fill = sectionEl.querySelector('[data-cwc-load-fill]');

    /* The fetched page's own counter is already the running total, so copy it
       across rather than recounting cards here. */
    function syncProgress(parsed) {
      var nextProgress = parsed.querySelector('[data-cwc-load-progress]');
      if (progress && nextProgress) progress.textContent = nextProgress.textContent;

      var nextFill = parsed.querySelector('[data-cwc-load-fill]');
      if (fill && nextFill) fill.style.width = nextFill.style.width;
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      var url = button.getAttribute('href');
      if (!url) return;

      button.classList.add('cwc_collection-body__button--loading');

      fetch(url)
        .then(function (response) {
          if (!response.ok) throw new Error('Failed to load');
          return response.text();
        })
        .then(function (html) {
          var parsed = new DOMParser().parseFromString(html, 'text/html');
          var nextGrid = parsed.querySelector('[data-cwc-grid]');
          var nextButton = parsed.querySelector('[data-cwc-load-more]');

          if (nextGrid) {
            Array.prototype.forEach.call(nextGrid.children, function (card) {
              grid.appendChild(card.cloneNode(true));
            });
            bindAddToCart(sectionEl);
            syncProgress(parsed);
          }

          if (nextButton) {
            button.setAttribute('href', nextButton.getAttribute('href'));
          } else {
            button.remove();
          }
        })
        .catch(function () {
          /* fall back to normal navigation */
          window.location.href = url;
        })
        .finally(function () {
          button.classList.remove('cwc_collection-body__button--loading');
        });
    });
  }

  function bindAddToCart(sectionEl) {
    /* scoped to <button> — sold-out cards reuse the class on an <a> that just
       navigates to the product page */
    sectionEl.querySelectorAll('button.cwc_collection-body__card-button').forEach(function (button) {
      if (button.dataset.cwcBound === 'true') return;
      button.dataset.cwcBound = 'true';

      button.addEventListener('click', function () {
        var variantId = button.dataset.variantId;
        if (!variantId) return;

        button.classList.add('cwc_collection-body__card-button--loading');

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
        })
          .then(function (response) {
            if (!response.ok) throw new Error('Add to cart failed');
            return response.json();
          })
          .then(function () {
            button.classList.remove('cwc_collection-body__card-button--loading');
            button.classList.add('cwc_collection-body__card-button--added');
            document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));
            window.setTimeout(function () {
              button.classList.remove('cwc_collection-body__card-button--added');
            }, 1600);
          })
          .catch(function () {
            button.classList.remove('cwc_collection-body__card-button--loading');
          });
      });
    });
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcCollectionBodyInit === 'true') return;
    sectionEl.dataset.cwcCollectionBodyInit = 'true';

    /* tells the CSS it can hide the no-JS sort Go button. the filter Apply
       button stays — the sheet layout below does not auto-submit. */
    sectionEl.setAttribute('data-cwc-enhanced', 'true');

    initSheets(sectionEl);
    initAutoSubmit(sectionEl);
    initLoadMore(sectionEl);
    bindAddToCart(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_collection-body').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_collection-body');
    if (section) initSection(section);
  });
})();
