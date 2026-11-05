(function () {
  'use strict';

  const DRAWER_QUERY = '(max-width: 991px)';

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcInit === 'true') return;
    sectionEl.dataset.cwcInit = 'true';

    const state = {
      sectionId: sectionEl.dataset.sectionId,
      controller: null,
      priceTimer: null,
      lastFocus: null,
      groups: {}
    };

    setupFilterToggle(sectionEl, state);
    setupFilterForm(sectionEl, state);
    setupLinks(sectionEl, state);
    setupLoadMore(sectionEl, state);
    setupGroups(sectionEl, state);
    setupToolbarHeight(sectionEl);
  }

  /* === Sticky filters sit under the sticky toolbar, so publish its height ===
     The toolbar itself sits under the site header when that header is sticky.
     CWC_header publishes the height of whatever part of it is showing as
     --cwc-header-height on <html>; fall back to measuring its section. */
  function siteHeaderHeight() {
    const published = parseFloat(
      document.documentElement.style.getPropertyValue('--cwc-header-height')
    );
    if (!isNaN(published)) return published;

    const header = document.querySelector('.cwc_header--sticky');
    if (!header) return 0;
    const wrapper = header.closest('.shopify-section') || header;
    const position = window.getComputedStyle(wrapper).position;
    if (position !== 'sticky' && position !== 'fixed') return 0;
    return header.offsetHeight;
  }

  function setupToolbarHeight(sectionEl) {
    const toolbar = sectionEl.querySelector('.cwc_collection-grid__toolbar');
    if (!toolbar || !sectionEl.classList.contains('cwc_collection-grid--sticky')) return;

    function measure() {
      // When the header publishes its height on <html>, inherit it live so the
      // toolbar follows the header as it shrinks on scroll
      if (document.documentElement.style.getPropertyValue('--cwc-header-height')) {
        sectionEl.style.removeProperty('--cwc-header-height');
      } else {
        sectionEl.style.setProperty('--cwc-header-height', siteHeaderHeight() + 'px');
      }
      sectionEl.style.setProperty('--cg-toolbar-height', toolbar.offsetHeight + 'px');
    }

    window.addEventListener('resize', measure);

    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(toolbar);
  }

  /* === Filter groups: remember which ones the shopper opened or closed === */
  function setupGroups(sectionEl, state) {
    sectionEl.addEventListener('click', function (event) {
      const summary = event.target.closest('.cwc_collection-grid__group-title');
      if (!summary) return;
      const group = summary.parentElement;
      // The click runs before the toggle, so the new state is the opposite of the current one
      if (group && group.dataset.cwcGroup) state.groups[group.dataset.cwcGroup] = !group.open;
    });
  }

  // Before the filters are re-rendered: note how far each list was scrolled
  function readGroupScroll(sectionEl) {
    const scroll = {};
    sectionEl.querySelectorAll('[data-cwc-group]').forEach(function (group) {
      const list = group.querySelector('.cwc_collection-grid__options');
      if (list && list.scrollTop) scroll[group.dataset.cwcGroup] = list.scrollTop;
    });
    return scroll;
  }

  // After: put back the shopper's open / closed choices and the list scroll
  function restoreGroups(sectionEl, state, scroll) {
    sectionEl.querySelectorAll('[data-cwc-group]').forEach(function (group) {
      const key = group.dataset.cwcGroup;
      if (Object.prototype.hasOwnProperty.call(state.groups, key)) group.open = state.groups[key];
      const list = group.querySelector('.cwc_collection-grid__options');
      if (list && scroll[key]) list.scrollTop = scroll[key];
    });
  }

  /* === Filter toggle: hide sidebar on desktop, open sheet on tablet/mobile === */
  function setupFilterToggle(sectionEl, state) {
    const toggle = sectionEl.querySelector('.cwc_collection-grid__filter-toggle');
    const sidebar = sectionEl.querySelector('.cwc_collection-grid__sidebar');
    if (!toggle || !sidebar) return;

    const desktopLabel = toggle.querySelector('.cwc_collection-grid__filter-toggle-desktop');

    toggle.addEventListener('click', function () {
      if (window.matchMedia(DRAWER_QUERY).matches) {
        openDrawer(sectionEl, state, toggle);
        return;
      }
      const hidden = sectionEl.classList.toggle('cwc_collection-grid--filters-hidden');
      toggle.setAttribute('aria-expanded', hidden ? 'false' : 'true');
      if (desktopLabel) desktopLabel.textContent = hidden ? 'Show filters' : 'Hide filters';
    });

    // Close buttons / overlay
    sectionEl.addEventListener('click', function (event) {
      if (event.target.closest('[data-cwc-close]')) closeDrawer(sectionEl, state);
    });

    sectionEl.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && sectionEl.classList.contains('cwc_collection-grid--drawer-open')) {
        closeDrawer(sectionEl, state);
      }
    });
  }

  function openDrawer(sectionEl, state, trigger) {
    const sidebar = sectionEl.querySelector('.cwc_collection-grid__sidebar');
    if (!sidebar) return;
    state.lastFocus = trigger || document.activeElement;
    sectionEl.classList.add('cwc_collection-grid--drawer-open');
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    document.documentElement.style.overflow = 'hidden';
    sidebar.focus();
  }

  function closeDrawer(sectionEl, state) {
    const sidebar = sectionEl.querySelector('.cwc_collection-grid__sidebar');
    if (!sectionEl.classList.contains('cwc_collection-grid--drawer-open')) return;
    sectionEl.classList.remove('cwc_collection-grid--drawer-open');
    if (sidebar) {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
    }
    document.documentElement.style.overflow = '';
    if (state.lastFocus && document.contains(state.lastFocus)) state.lastFocus.focus();
  }

  /* === Filter form + sort === */
  function setupFilterForm(sectionEl, state) {
    const form = sectionEl.querySelector('.cwc_collection-grid__form');
    const sort = sectionEl.querySelector('.cwc_collection-grid__sort-select');

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(sectionEl, state, formQuery(form, sectionEl));
      });

      form.addEventListener('change', function (event) {
        if (event.target.classList.contains('cwc_collection-grid__price-input')) return;
        render(sectionEl, state, formQuery(form, sectionEl));
      });

      // Price: wait for the shopper to stop typing
      form.addEventListener('input', function (event) {
        if (!event.target.classList.contains('cwc_collection-grid__price-input')) return;
        clearTimeout(state.priceTimer);
        state.priceTimer = setTimeout(function () {
          render(sectionEl, state, formQuery(form, sectionEl));
        }, 700);
      });
    }

    if (sort) {
      sort.addEventListener('change', function () {
        if (form) {
          render(sectionEl, state, formQuery(form, sectionEl));
        } else {
          const params = new URLSearchParams(window.location.search);
          params.set('sort_by', sort.value);
          params.delete('page');
          render(sectionEl, state, params.toString());
        }
      });
    }
  }

  // Build the query from the form (includes the sort select via its form attribute)
  function formQuery(form, sectionEl) {
    const params = new URLSearchParams();
    const data = new FormData(form);
    data.forEach(function (value, key) {
      if (value === '') return;
      params.append(key, value);
    });

    const sort = sectionEl.querySelector('.cwc_collection-grid__sort-select');
    if (sort && !params.has('sort_by')) params.set('sort_by', sort.value);
    return params.toString();
  }

  /* === Chips, Clear all, In stock only === */
  function setupLinks(sectionEl, state) {
    sectionEl.addEventListener('click', function (event) {
      const link = event.target.closest('[data-cwc-link]');
      if (!link || !sectionEl.contains(link)) return;
      event.preventDefault();
      const url = new URL(link.href, window.location.origin);
      render(sectionEl, state, url.searchParams.toString());
    });

    window.addEventListener('popstate', function () {
      render(sectionEl, state, window.location.search.replace(/^\?/, ''), true);
    });
  }

  /* === Load more: append the next page of cards === */
  function setupLoadMore(sectionEl, state) {
    sectionEl.addEventListener('click', function (event) {
      const link = event.target.closest('[data-cwc-load-more]');
      if (!link || !sectionEl.contains(link)) return;
      event.preventDefault();
      link.setAttribute('aria-busy', 'true');

      const url = new URL(link.href, window.location.origin);
      url.searchParams.set('section_id', state.sectionId);

      fetch(url.toString())
        .then(function (response) { return response.text(); })
        .then(function (html) {
          const fresh = parseSection(html);
          if (!fresh) throw new Error('Section not found');

          const grid = sectionEl.querySelector('.cwc_collection-grid__grid');
          const newItems = fresh.querySelectorAll('.cwc_collection-grid__item');
          if (grid && newItems.length) {
            const firstNew = newItems[0];
            newItems.forEach(function (item) { grid.appendChild(item); });
            const focusTarget = firstNew.querySelector('.cwc_collection-body__card-title');
            if (focusTarget) focusTarget.focus({ preventScroll: true });
          }
          swapRegion(sectionEl, fresh, 'pagination');
        })
        .catch(function () {
          window.location.href = link.href;
        });
    });
  }

  /* === Fetch the section for a query and swap the regions === */
  function render(sectionEl, state, query, fromHistory) {
    if (state.controller) state.controller.abort();
    state.controller = new AbortController();

    const base = sectionEl.dataset.collectionUrl || window.location.pathname;
    const params = new URLSearchParams(query);
    params.delete('page');
    params.delete('section_id');
    const cleanQuery = params.toString();
    params.set('section_id', state.sectionId);

    sectionEl.classList.add('cwc_collection-grid--loading');

    fetch(base + '?' + params.toString(), { signal: state.controller.signal })
      .then(function (response) { return response.text(); })
      .then(function (html) {
        const fresh = parseSection(html);
        if (!fresh) throw new Error('Section not found');

        const active = document.activeElement;
        const activeId = active && sectionEl.contains(active) ? active.id : null;
        const groupScroll = readGroupScroll(sectionEl);

        ['filter-count', 'stock', 'count', 'chips-mobile', 'filters', 'drawer-foot', 'chips', 'grid', 'pagination'].forEach(function (name) {
          swapRegion(sectionEl, fresh, name);
        });
        restoreGroups(sectionEl, state, groupScroll);

        // Keep focus on the control the shopper was using
        if (activeId) {
          const again = document.getElementById(activeId);
          if (again) {
            again.focus({ preventScroll: true });
            if (again.type === 'number' && typeof again.value === 'string') {
              try { again.setSelectionRange(again.value.length, again.value.length); } catch (e) { /* number inputs */ }
            }
          }
        }

        if (!fromHistory) {
          const newUrl = base + (cleanQuery ? '?' + cleanQuery : '');
          window.history.pushState({ cwcCollection: true }, '', newUrl);
        }
      })
      .catch(function (error) {
        if (error.name === 'AbortError') return;
        window.location.href = base + (cleanQuery ? '?' + cleanQuery : '');
      })
      .finally(function () {
        sectionEl.classList.remove('cwc_collection-grid--loading');
      });
  }

  function parseSection(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('.cwc_collection-grid');
  }

  function swapRegion(sectionEl, fresh, name) {
    const current = sectionEl.querySelector('[data-cwc-region="' + name + '"]');
    const next = fresh.querySelector('[data-cwc-region="' + name + '"]');
    if (!current || !next) return;
    current.innerHTML = next.innerHTML;
    if (next.className !== current.className) current.className = next.className;
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_collection-grid').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_collection-grid');
    if (section) initSection(section);
  });
})();
