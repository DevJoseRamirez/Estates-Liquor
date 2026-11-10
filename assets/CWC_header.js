(function () {
  'use strict';

  /* Enhancement only. Without this file the mega panels still open on hover
     and keyboard focus in CSS, search is a plain GET form, the mobile
     accordions are <details> and the cart icon is a link to /cart. */

  const DESKTOP = window.matchMedia('(min-width: 992px)');
  const root =
    (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  /* ------------------------------
     Cart drawer
     The theme's own header opens its cart drawer by emitting on the shared
     eventBus (see Header.onCartButtonClick in theme.js); component-cart-drawer
     listens for it. Match that rather than reaching into the component.
     ------------------------------ */
  function cartDrawerReady() {
    const bus = window.eventBus;
    const listeners = bus && bus.listeners && bus.listeners['open:cart:drawer'];
    return Boolean(listeners && listeners.size);
  }

  function openCartDrawer() {
    window.eventBus.emit('open:cart:drawer', { scrollToTop: false });
  }

  /* ------------------------------
     Mega menu
     ------------------------------ */
  function initMega(sectionEl, signal) {
    const items = Array.from(sectionEl.querySelectorAll('.cwc_header__nav-item--has-mega'));
    if (!items.length) return null;

    let openTimer = null;
    let closeTimer = null;
    let lastPointer = 'mouse';
    let openItem = null;

    function setExpanded(item, expanded) {
      const link = item.querySelector('.cwc_header__nav-link');
      if (link) link.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    function close(item) {
      const target = item || openItem;
      if (!target) return;
      target.classList.remove('cwc_header__nav-item--open');
      setExpanded(target, false);
      if (openItem === target) {
        openItem = null;
        announce(false);
      }
    }

    // Lets the page overlay follow the panel without knowing about items
    function announce(isOpen) {
      sectionEl.dispatchEvent(new CustomEvent('cwc:mega-toggle', { detail: { open: isOpen } }));
    }

    // Room left between the panel's top edge and the bottom of the screen. The
    // panel is laid out while hidden, so its position can be read before it shows.
    function fitPanel(item) {
      const panel = item.querySelector('.cwc_header__mega');
      if (!panel) return;
      const room = window.innerHeight - panel.getBoundingClientRect().top - 16;
      sectionEl.style.setProperty('--hd-mega-max-height', Math.max(room, 240) + 'px');
    }

    function open(item) {
      if (openItem && openItem !== item) close(openItem);
      fitPanel(item);
      item.classList.add('cwc_header__nav-item--open');
      item.classList.remove('cwc_header__nav-item--suppressed');
      setExpanded(item, true);
      openItem = item;
      announce(true);
    }

    function clearTimers() {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
    }

    items.forEach(function (item) {
      const link = item.querySelector('.cwc_header__nav-link');
      setExpanded(item, false);

      // Pointer events fire before the mouse events a tap emulates, so this
      // tells a real hover apart from a touch
      item.addEventListener(
        'pointerenter',
        function (event) {
          lastPointer = event.pointerType || 'mouse';
        },
        { signal: signal }
      );

      // Small delays so sweeping the pointer across the nav doesn't flash panels
      item.addEventListener(
        'mouseenter',
        function () {
          if (lastPointer === 'touch') return;
          clearTimers();
          openTimer = window.setTimeout(
            function () {
              open(item);
            },
            openItem ? 0 : 90
          );
        },
        { signal: signal }
      );

      item.addEventListener(
        'mouseleave',
        function () {
          if (lastPointer === 'touch') return;
          clearTimers();
          closeTimer = window.setTimeout(function () {
            close(item);
          }, 160);
        },
        { signal: signal }
      );

      // Touch: first tap opens the panel, second tap follows the link
      if (link) {
        link.addEventListener(
          'pointerdown',
          function (event) {
            lastPointer = event.pointerType || 'mouse';
          },
          { signal: signal }
        );

        link.addEventListener(
          'click',
          function (event) {
            if (lastPointer !== 'touch') return;
            if (!item.classList.contains('cwc_header__nav-item--open')) {
              event.preventDefault();
              open(item);
            }
          },
          { signal: signal }
        );
      }

      item.addEventListener(
        'focusout',
        function (event) {
          if (!item.contains(event.relatedTarget)) {
            close(item);
            item.classList.remove('cwc_header__nav-item--suppressed');
          }
        },
        { signal: signal }
      );

      item.addEventListener(
        'keydown',
        function (event) {
          if (event.key !== 'Escape') return;
          close(item);
          // Keyboard focus would otherwise hold the panel open via :focus-visible
          item.classList.add('cwc_header__nav-item--suppressed');
          if (link) link.focus();
        },
        { signal: signal }
      );
    });

    document.addEventListener(
      'click',
      function (event) {
        if (openItem && !openItem.contains(event.target)) close(openItem);
      },
      { signal: signal }
    );

    window.addEventListener(
      'resize',
      function () {
        if (openItem) fitPanel(openItem);
      },
      { signal: signal }
    );

    // Theme editor: show the panel whose block is being edited
    sectionEl.addEventListener(
      'shopify:block:select',
      function (event) {
        const item = event.target.closest('.cwc_header__nav-item--has-mega');
        if (item) open(item);
      },
      { signal: signal }
    );

    sectionEl.addEventListener(
      'shopify:block:deselect',
      function () {
        close();
      },
      { signal: signal }
    );

    return {
      isOpen: function () {
        return Boolean(openItem);
      },
      refit: function () {
        if (openItem) fitPanel(openItem);
      },
      closeAll: function () {
        close();
      }
    };
  }

  /* ------------------------------
     Mega product tabs
     Hovering or focusing a tab shows its bottles. The tabs stay real links,
     so a click still goes to the collection.
     ------------------------------ */
  function initMegaTabs(sectionEl, signal) {
    sectionEl.querySelectorAll('[data-cwc-mega-tabs]').forEach(function (panel) {
      const tabs = Array.from(panel.querySelectorAll('[data-cwc-mega-tab]'));
      const panes = Array.from(panel.querySelectorAll('[data-cwc-mega-tabpanel]'));
      if (tabs.length < 2) return;

      function show(index) {
        tabs.forEach(function (tab) {
          tab.classList.toggle('cwc_header__mega-tab--active', tab.dataset.cwcMegaTab === index);
        });
        panes.forEach(function (pane) {
          pane.hidden = pane.dataset.cwcMegaTabpanel !== index;
        });
      }

      tabs.forEach(function (tab) {
        ['mouseenter', 'focus'].forEach(function (type) {
          tab.addEventListener(
            type,
            function () {
              show(tab.dataset.cwcMegaTab);
            },
            { signal: signal }
          );
        });
      });
    });
  }

  /* ------------------------------
     Predictive search
     Runs on the desktop header search and on the mobile menu's search.
     ------------------------------ */
  function initSearch(wrapper, signal) {
    if (!wrapper) return null;

    const input = wrapper.querySelector('[data-cwc-search-input]');
    const results = wrapper.querySelector('[data-cwc-search-results]');
    const status = wrapper.querySelector('[data-cwc-search-status]');
    const form = wrapper.querySelector('form');
    if (!input || !results || !form || wrapper.dataset.predictive !== 'true') return null;

    let debounce = null;
    let controller = null;
    // Mobile menu search: bottles first, no query suggestions
    // (the mobile search row under the bar gets the same treatment)
    const isMenuSearch =
      wrapper.classList.contains('cwc_header__menu-search-wrap') ||
      Boolean(wrapper.closest('.cwc_header__msearch'));

    input.setAttribute('aria-controls', results.id);
    input.setAttribute('aria-expanded', 'false');

    function isOpen() {
      return !results.hidden;
    }

    function hide() {
      results.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }

    function show() {
      results.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function el(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    }

    // prices arrive as major-unit strings ("42.99"), not cents
    function formatMoney(value) {
      const amount = parseFloat(value);
      if (isNaN(amount)) return '';
      const currency =
        (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD';
      try {
        return new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
          style: 'currency',
          currency: currency
        }).format(amount);
      } catch (e) {
        return '$' + amount.toFixed(2);
      }
    }

    function searchUrl(query) {
      return (
        root +
        'search?type=product&options%5Bprefix%5D=last&q=' +
        encodeURIComponent(query)
      );
    }

    function group(title, list) {
      const section = el('div', 'cwc_header__search-group');
      section.appendChild(el('p', 'cwc_header__search-group-title', title));
      const ul = el('ul', 'cwc_header__search-list');
      list.forEach(function (node) {
        const li = el('li');
        li.appendChild(node);
        ul.appendChild(li);
      });
      section.appendChild(ul);
      return section;
    }

    function textItem(href, label) {
      const a = el('a', 'cwc_header__search-item', label);
      a.href = href;
      return a;
    }

    function productItem(product) {
      const a = el('a', 'cwc_header__search-item cwc_header__search-item--product');
      a.href = product.url;

      // Image sits on the brand image ground; desktop shows it as a card
      const media = el('span', 'cwc_header__search-media');
      const imageUrl = (product.featured_image && product.featured_image.url) || product.image;
      if (imageUrl) {
        const img = el('img', 'cwc_header__search-thumb');
        img.src = imageUrl + (imageUrl.indexOf('?') > -1 ? '&' : '?') + 'width=360';
        img.alt = '';
        img.width = 180;
        img.height = 180;
        img.loading = 'lazy';
        media.appendChild(img);
      }
      a.appendChild(media);

      const body = el('span', 'cwc_header__search-body');
      if (product.vendor) body.appendChild(el('span', 'cwc_header__search-vendor', product.vendor));
      body.appendChild(el('span', 'cwc_header__search-name', product.title));
      const price = formatMoney(product.price);
      if (price) body.appendChild(el('span', 'cwc_header__search-price', price));
      a.appendChild(body);
      return a;
    }

    function render(data, query) {
      const res = (data && data.resources && data.resources.results) || {};
      // Mobile (menu search or below the desktop breakpoint): max 3 text suggestions
      const isMobile = isMenuSearch || window.matchMedia('(max-width: 991px)').matches;
      const maxItems = isMobile ? 3 : undefined;
      const queries = (res.queries || []).slice(0, maxItems);
      // Products tagged no_feed (e.g. shipping protection) never show
      const products = (res.products || [])
        .filter(function (product) {
          const tags = (product.tags || []).map(function (tag) {
            return String(tag).toLowerCase();
          });
          return tags.indexOf('no_feed') === -1 && tags.indexOf('no-feed') === -1;
        })
        .slice(0, 10);
      const collections = (res.collections || []).slice(0, maxItems);

      results.textContent = '';

      // Panel: collections + suggestions on the left, bottles on the right
      const panel = el('div', 'cwc_header__search-panel');
      const aside = el('div', 'cwc_header__search-aside');
      const main = el('div', 'cwc_header__search-main');

      if (collections.length) {
        aside.appendChild(
          group(
            'Collections',
            collections.map(function (c) {
              return textItem(c.url, c.title);
            })
          )
        );
      }
      if (queries.length && !isMenuSearch) {
        aside.appendChild(
          group(
            'Suggestions',
            queries.map(function (q) {
              return textItem(q.url, q.text);
            })
          )
        );
      }

      if (products.length) {
        const bottles = group('Bottles', products.map(productItem));
        bottles.querySelector('ul').classList.add('cwc_header__search-list--products');
        main.appendChild(bottles);
      } else {
        main.appendChild(
          el(
            'p',
            'cwc_header__search-empty',
            'No bottles match “' + query + '”. Try a brand, style, or region.'
          )
        );
      }

      const all = el('a', 'cwc_header__search-all', 'View all results for “' + query + '” →');
      all.href = searchUrl(query);
      main.appendChild(all);

      if (!aside.childElementCount) {
        panel.classList.add('cwc_header__search-panel--single');
        panel.appendChild(main);
      } else if (isMenuSearch) {
        // Mobile: bottles lead, collections follow underneath
        panel.appendChild(main);
        panel.appendChild(aside);
      } else {
        panel.appendChild(aside);
        panel.appendChild(main);
      }
      results.appendChild(panel);

      if (status) status.textContent = products.length + ' bottles found';
      show();
    }

    function search(query) {
      if (controller) controller.abort();
      controller = new AbortController();

      const params = new URLSearchParams();
      params.set('q', query);
      params.set('resources[type]', 'query,product,collection');
      // A couple spare, since no_feed products are dropped after the fetch
      params.set('resources[limit]', '10');
      params.set('resources[limit_scope]', 'each');
      params.set('resources[options][unavailable_products]', 'last');

      fetch(root + 'search/suggest.json?' + params.toString(), { signal: controller.signal })
        .then(function (response) {
          if (!response.ok) throw new Error('Search failed');
          return response.json();
        })
        .then(function (data) {
          if (input.value.trim() === query) render(data, query);
        })
        .catch(function (error) {
          if (error.name !== 'AbortError') hide();
        });
    }

    input.addEventListener(
      'input',
      function () {
        window.clearTimeout(debounce);
        const query = input.value.trim();
        if (query.length < 2) {
          if (controller) controller.abort();
          hide();
          return;
        }
        debounce = window.setTimeout(function () {
          search(query);
        }, 200);
      },
      { signal: signal }
    );

    input.addEventListener(
      'focus',
      function () {
        if (results.childElementCount && input.value.trim().length >= 2) show();
      },
      { signal: signal }
    );

    // Arrow keys move between the input and the result links
    wrapper.addEventListener(
      'keydown',
      function (event) {
        if (event.key === 'Escape' && isOpen()) {
          // Close only the suggestions, not the mobile menu around them
          event.stopPropagation();
          hide();
          input.focus();
          return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        if (!isOpen()) return;

        const links = Array.from(results.querySelectorAll('a'));
        if (!links.length) return;
        event.preventDefault();

        const index = links.indexOf(document.activeElement);
        if (event.key === 'ArrowDown') {
          links[index < links.length - 1 ? index + 1 : 0].focus();
        } else if (index <= 0) {
          input.focus();
        } else {
          links[index - 1].focus();
        }
      },
      { signal: signal }
    );

    // Safari doesn't focus a tapped link, so a tap on a result blurs the input
    // with no relatedTarget. Skip that blur; the document click handler below
    // still closes the panel for taps outside it.
    let pointerInside = false;
    wrapper.addEventListener(
      'pointerdown',
      function () {
        pointerInside = true;
        window.setTimeout(function () {
          pointerInside = false;
        }, 500);
      },
      { signal: signal }
    );

    wrapper.addEventListener(
      'focusout',
      function (event) {
        if (pointerInside) return;
        if (!wrapper.contains(event.relatedTarget)) hide();
      },
      { signal: signal }
    );

    document.addEventListener(
      'click',
      function (event) {
        if (!wrapper.contains(event.target)) hide();
      },
      { signal: signal }
    );

    return {
      isActive: function () {
        return isOpen() || document.activeElement === input;
      },
      hide: hide
    };
  }

  /* ------------------------------
     Page overlay
     Tints the page below the header while the top-bar search has focus or
     its suggestions are open, and while a mega panel is open. Each is
     switched on separately (data-search / data-mega on the overlay). The
     overlay shows while either one needs it.
     ------------------------------ */
  function initOverlay(sectionEl, search, mega, signal) {
    const overlay = document.getElementById('cwc_header-overlay-' + sectionEl.dataset.sectionId);
    if (!overlay) return;

    const wrapper = overlay.dataset.search === 'true' ? sectionEl.querySelector('[data-cwc-search]') : null;
    const useMega = overlay.dataset.mega === 'true' && Boolean(mega);
    const input = wrapper ? wrapper.querySelector('[data-cwc-search-input]') : null;
    const results = wrapper ? wrapper.querySelector('[data-cwc-search-results]') : null;
    const reasons = { search: false, mega: false };
    let active = false;
    let frame = null;

    // Overlay starts where the header ends, so the whole header stays clear
    function place() {
      frame = null;
      const bottom = Math.max(0, Math.round(sectionEl.getBoundingClientRect().bottom));
      overlay.style.setProperty('--cwc-search-overlay-top', bottom + 'px');
    }

    function queuePlace() {
      if (active && !frame) frame = window.requestAnimationFrame(place);
    }

    function update() {
      const next = reasons.search || reasons.mega;
      if (next === active) return;
      active = next;
      if (active) place();
      overlay.classList.toggle('cwc_header__overlay--active', active);
    }

    function open() {
      if (reasons.search) return;
      reasons.search = true;
      sectionEl.classList.add('cwc_header--search-active');
      update();
    }

    function close() {
      if (!reasons.search) return;
      reasons.search = false;
      sectionEl.classList.remove('cwc_header--search-active');
      update();
    }

    if (useMega) {
      sectionEl.addEventListener(
        'cwc:mega-toggle',
        function (event) {
          reasons.mega = Boolean(event.detail && event.detail.open);
          update();
        },
        { signal: signal }
      );
    }

    overlay.addEventListener(
      'click',
      function () {
        if (reasons.mega && mega) mega.closeAll();
        if (reasons.search) {
          if (search) search.hide();
          if (input) input.blur();
          close();
        }
      },
      { signal: signal }
    );

    window.addEventListener('scroll', queuePlace, { passive: true, signal: signal });
    window.addEventListener('resize', queuePlace, { signal: signal });
    sectionEl.addEventListener('transitionend', queuePlace, { signal: signal });
    signal.addEventListener('abort', function () {
      reasons.mega = false;
      close();
      update();
    });

    if (!wrapper) return;

    function resultsOpen() {
      return results && !results.hidden;
    }

    // Re-check after focus settles: stay open while focus is in the search
    // or its suggestions are still showing
    function sync() {
      window.setTimeout(function () {
        if (wrapper.contains(document.activeElement) || resultsOpen()) open();
        else close();
      }, 0);
    }

    wrapper.addEventListener('focusin', open, { signal: signal });
    wrapper.addEventListener('focusout', sync, { signal: signal });

    // Suggestions panel opening/closing (e.g. hidden by an outside click)
    if (results) {
      new MutationObserver(sync).observe(results, { attributes: true, attributeFilter: ['hidden'] });
    }

    wrapper.addEventListener(
      'keydown',
      function (event) {
        // Second Escape (suggestions already closed) leaves the search
        if (event.key === 'Escape' && !resultsOpen() && input) {
          input.blur();
          close();
        }
      },
      // Capture runs before the search's own Escape handler closes the
      // suggestions, so the first Escape only closes the suggestions
      { signal: signal, capture: true }
    );
  }

  /* ------------------------------
     Mobile menu
     ------------------------------ */
  function initMenu(sectionEl, signal) {
    const menu = document.getElementById('cwc_header-menu-' + sectionEl.dataset.sectionId);
    const openers = Array.from(sectionEl.querySelectorAll('[data-cwc-menu-open]'));
    if (!menu || !openers.length) return null;

    const closeBtn = menu.querySelector('[data-cwc-menu-close]');
    const searchInput = menu.querySelector('[data-cwc-menu-search]');
    let lastOpener = null;
    let hideTimer = null;

    function focusables() {
      return Array.from(
        menu.querySelectorAll('a[href], button, input, summary, [tabindex]:not([tabindex="-1"])')
      ).filter(function (node) {
        return node.offsetParent !== null;
      });
    }

    function setExpanded(expanded) {
      openers.forEach(function (btn) {
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    }

    function open(opener) {
      window.clearTimeout(hideTimer);
      lastOpener = opener || null;
      menu.hidden = false;
      document.documentElement.classList.add('cwc-menu-locked');
      setExpanded(true);
      window.requestAnimationFrame(function () {
        menu.classList.add('cwc_header__menu--open');
      });

      const wantsSearch = opener && opener.hasAttribute('data-cwc-menu-search-focus');
      const target = wantsSearch && searchInput ? searchInput : closeBtn;
      if (target) target.focus({ preventScroll: true });
    }

    function close() {
      if (menu.hidden) return;
      menu.classList.remove('cwc_header__menu--open');
      document.documentElement.classList.remove('cwc-menu-locked');
      setExpanded(false);
      hideTimer = window.setTimeout(function () {
        menu.hidden = true;
      }, 250);
      if (lastOpener && DESKTOP.matches === false) lastOpener.focus({ preventScroll: true });
    }

    openers.forEach(function (btn) {
      btn.addEventListener(
        'click',
        function () {
          open(btn);
        },
        { signal: signal }
      );
    });

    if (closeBtn) closeBtn.addEventListener('click', close, { signal: signal });

    menu.addEventListener(
      'keydown',
      function (event) {
        if (event.key === 'Escape') {
          close();
          return;
        }
        if (event.key !== 'Tab') return;

        // Keep focus inside the open menu
        const nodes = focusables();
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      },
      { signal: signal }
    );

    DESKTOP.addEventListener(
      'change',
      function (event) {
        if (event.matches) close();
      },
      { signal: signal }
    );

    return { close: close };
  }

  /* ------------------------------
     Cart icon + count
     ------------------------------ */
  function initCart(sectionEl, menuApi, signal) {
    const menu = document.getElementById('cwc_header-menu-' + sectionEl.dataset.sectionId);
    const scopes = [sectionEl, menu].filter(Boolean);

    function collect(selector) {
      return scopes.reduce(function (list, scope) {
        return list.concat(Array.from(scope.querySelectorAll(selector)));
      }, []);
    }

    function setCount(count) {
      if (typeof count !== 'number') return;
      collect('[data-cwc-cart-count]').forEach(function (node) {
        node.textContent = count;
        node.hidden = count === 0;
      });
      collect('[data-cwc-cart]').forEach(function (link) {
        link.setAttribute('aria-label', 'Cart, ' + count + ' items');
      });
    }

    function refresh() {
      fetch(root + 'cart.js')
        .then(function (response) {
          if (!response.ok) throw new Error('Cart read failed');
          return response.json();
        })
        .then(function (cart) {
          setCount(cart.item_count);
        })
        .catch(function () {
          /* leave the server-rendered count in place */
        });
    }

    collect('[data-cwc-cart]').forEach(function (link) {
      link.addEventListener(
        'click',
        function (event) {
          // nothing listening yet: leave the click alone so it reaches the cart page
          if (!cartDrawerReady() || window.location.pathname === link.pathname) return;
          event.preventDefault();
          if (menuApi) menuApi.close();
          openCartDrawer();
        },
        { signal: signal }
      );
    });

    // every CWC section that adds to cart fires this
    document.addEventListener('cwc:cart:added', refresh, { signal: signal });

    document.addEventListener(
      'cart:updated',
      function (event) {
        const cart = event.detail && event.detail.cart;
        if (cart) setCount(cart.item_count);
      },
      { signal: signal }
    );

    // Back/forward cache can restore a stale count
    window.addEventListener(
      'pageshow',
      function (event) {
        if (event.persisted) refresh();
      },
      { signal: signal }
    );
  }

  /* ------------------------------
     Sticky height + shrink on scroll
     ------------------------------ */
  function initScroll(sectionEl, mega, search, mobileSearch, signal) {
    const top = sectionEl.querySelector('[data-cwc-header-top]');
    const msearch = sectionEl.querySelector('[data-cwc-msearch]');
    const nav = sectionEl.querySelector('.cwc_header__nav');
    const sticky = sectionEl.dataset.sticky === 'true';
    const hideOnScroll = sticky && sectionEl.dataset.hideOnScroll === 'true' && Boolean(nav);
    // hide_top: the top bar slides away. hide_nav: the menu row tucks under the top bar
    const hideNav = sectionEl.dataset.scrollMode === 'hide_nav';
    const navToggle = sectionEl.querySelector('[data-cwc-nav-toggle]');
    const docStyle = document.documentElement.style;

    let lastY = window.scrollY;
    // How far the shopper has scrolled up in one go; small trackpad jitters don't count
    let upTravel = 0;
    const REVEAL_AFTER = 36;
    // Scroll depth (px) before the header is allowed to shrink
    const HIDE_AFTER = 8;
    let ticking = false;

    // Sticky toolbars elsewhere (collection filters) sit below whatever part
    // of the header is showing
    function publishHeight() {
      let height = 0;
      if (sticky) {
        height = sectionEl.offsetHeight;
        if (msearch && sectionEl.classList.contains('cwc_header--msearch-hidden')) {
          height -= msearch.offsetHeight;
        }
        if (sectionEl.classList.contains('cwc_header--compact')) {
          if (hideNav) {
            if (nav && !sectionEl.classList.contains('cwc_header--nav-open')) height -= nav.offsetHeight;
          } else if (top) {
            height -= top.offsetHeight;
          }
        }
      }
      docStyle.setProperty('--cwc-header-height', height + 'px');
    }

    function measure() {
      if (top) sectionEl.style.setProperty('--hd-top-height', top.offsetHeight + 'px');
      publishHeight();
    }

    function setNavOpen(navOpen) {
      if (!hideNav || sectionEl.classList.contains('cwc_header--nav-open') === navOpen) return;
      sectionEl.classList.toggle('cwc_header--nav-open', navOpen);
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', navOpen ? 'true' : 'false');
        navToggle.setAttribute('aria-label', navOpen ? 'Hide menu' : 'Show menu');
        // Scroll-up reveals stay quiet; only a click marks the button active
        if (!navOpen) navToggle.classList.remove('cwc_header__nav-toggle--active');
      }
      if (!navOpen && mega) mega.closeAll();
      publishHeight();
    }

    function setCompact(compact) {
      if (sectionEl.classList.contains('cwc_header--compact') === compact) return;
      if (!compact) setNavOpen(false);
      sectionEl.classList.toggle('cwc_header--compact', compact);
      const navCart = sectionEl.querySelector('.cwc_header__nav-cart');
      if (navCart) navCart.setAttribute('tabindex', compact ? '0' : '-1');
      publishHeight();
    }

    // Mobile: the search row tucks behind the bar on the way down and comes
    // back once the shopper is at the top of the page again
    function setSearchHidden(hidden) {
      if (!msearch || sectionEl.classList.contains('cwc_header--msearch-hidden') === hidden) return;
      sectionEl.classList.toggle('cwc_header--msearch-hidden', hidden);
      if (hidden && mobileSearch) mobileSearch.hide();
      publishHeight();
    }

    function onScroll() {
      ticking = false;
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY;
      lastY = y;

      if (!DESKTOP.matches) {
        setCompact(false);
        if (!sticky) return;
        // Hold still while the shopper is typing in it
        if (mobileSearch && mobileSearch.isActive()) return;
        if (y <= HIDE_AFTER) setSearchHidden(false);
        else if (delta > 1) setSearchHidden(true);
        return;
      }

      setSearchHidden(false);

      if (!hideOnScroll) {
        setCompact(false);
        return;
      }

      // Hold still while the shopper is using the menu or search
      if ((mega && mega.isOpen()) || (search && search.isActive())) return;

      if (delta > 0) upTravel = 0;
      else if (delta < 0) upTravel -= delta;

      if (y <= HIDE_AFTER) {
        setCompact(false);
      } else if (delta > 1) {
        setCompact(true);
        setNavOpen(false);
      } else if (upTravel > REVEAL_AFTER) {
        // Heading back up: bring back whichever row was hidden. Keep-logo mode
        // stays shrunk, so the Menu button is still there to tuck the row away
        if (hideNav) setNavOpen(true);
        else setCompact(false);
      }
    }

    // A panel opened while a row was still sliding was measured mid-move
    sectionEl.addEventListener(
      'transitionend',
      function (event) {
        if (
          (event.target === sectionEl || event.target === nav) &&
          event.propertyName === 'transform' &&
          mega
        ) {
          mega.refit();
        }
      },
      { signal: signal }
    );

    if (navToggle) {
      navToggle.addEventListener(
        'click',
        function () {
          const willOpen = !sectionEl.classList.contains('cwc_header--nav-open');
          setNavOpen(willOpen);
          navToggle.classList.toggle('cwc_header__nav-toggle--active', willOpen);
        },
        { signal: signal }
      );
    }

    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(onScroll);
      },
      { passive: true, signal: signal }
    );

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measure);
      observer.observe(sectionEl);
      signal.addEventListener('abort', function () {
        observer.disconnect();
      });
    }

    DESKTOP.addEventListener(
      'change',
      function () {
        setCompact(false);
        setSearchHidden(false);
        measure();
      },
      { signal: signal }
    );

    measure();
  }

  /* ------------------------------
     Section init
     ------------------------------ */
  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.cwcController) return;

    const controller = new AbortController();
    const signal = controller.signal;
    sectionEl.cwcController = controller;
    sectionEl.classList.add('cwc_header--js');

    const mega = initMega(sectionEl, signal);
    initMegaTabs(sectionEl, signal);
    const search = initSearch(sectionEl.querySelector('[data-cwc-search]'), signal);
    const mobileSearch = initSearch(sectionEl.querySelector('[data-cwc-msearch] [data-cwc-search]'), signal);
    const menu = initMenu(sectionEl, signal);
    const menuEl = document.getElementById('cwc_header-menu-' + sectionEl.dataset.sectionId);
    if (menuEl) initSearch(menuEl.querySelector('[data-cwc-search]'), signal);
    initCart(sectionEl, menu, signal);
    initScroll(sectionEl, mega, search, mobileSearch, signal);
    initOverlay(sectionEl, search, mega, signal);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_header').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_header');
    if (section) initSection(section);
  });

  // Theme Editor: drop the old instance's document and window listeners
  document.addEventListener('shopify:section:unload', function (event) {
    const section = event.target.querySelector('.cwc_header');
    if (section && section.cwcController) {
      section.cwcController.abort();
      document.documentElement.classList.remove('cwc-menu-locked');
    }
  });
})();
