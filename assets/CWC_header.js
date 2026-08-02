(function () {
  'use strict';

  /* Enhancement only. The desktop dropdowns open on hover and :focus-within in
     CSS, and the drawer groups are <details> — so navigation still works with
     this file blocked. What is added here is the drawer itself and the live
     cart count. */

  function initDrawer(sectionEl) {
    var openButton = sectionEl.querySelector('[data-cwc-drawer-open]');
    if (!openButton) return;

    /* The drawer and overlay are siblings of the header, not children. */
    var root = sectionEl.parentNode;
    var drawer = root.querySelector('[data-cwc-drawer]');
    var overlay = root.querySelector('[data-cwc-drawer-overlay]');
    if (!drawer || !overlay) return;

    var closeButton = drawer.querySelector('[data-cwc-drawer-close]');
    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      drawer.removeAttribute('hidden');
      overlay.removeAttribute('hidden');
      /* next frame, so the transform transition actually runs */
      window.requestAnimationFrame(function () {
        drawer.classList.add('cwc_header__drawer--open');
      });
      openButton.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeButton) closeButton.focus();
    }

    function close() {
      drawer.classList.remove('cwc_header__drawer--open');
      overlay.setAttribute('hidden', '');
      openButton.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';

      /* wait out the slide before hiding, or it vanishes instantly */
      window.setTimeout(function () {
        drawer.setAttribute('hidden', '');
      }, 280);

      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    openButton.addEventListener('click', open);
    if (closeButton) closeButton.addEventListener('click', close);
    overlay.addEventListener('click', close);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !drawer.hasAttribute('hidden')) close();
    });

    /* A link tap should leave the drawer closed behind the new page. */
    drawer.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', close);
    });
  }

  var SEARCH_DEBOUNCE = 220;
  var SEARCH_MIN_LENGTH = 2;

  /* Predictive search against Shopify's /search/suggest.json. Results are
     rendered here rather than by a Liquid section, so there is no extra theme
     file that has to be present for the dropdown to work. */
  function initSearch(sectionEl) {
    var toggle = sectionEl.querySelector('[data-cwc-search-open]');
    var panel = sectionEl.querySelector('[data-cwc-search]');
    if (!toggle || !panel) return;

    var input = panel.querySelector('[data-cwc-search-input]');
    var results = panel.querySelector('[data-cwc-search-results]');
    var closeButton = panel.querySelector('[data-cwc-search-close]');
    if (!input || !results) return;

    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    var timer = null;
    var controller = null;
    var lastQuery = '';

    function open() {
      panel.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      input.focus();
      input.select();
    }

    function close() {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      window.clearTimeout(timer);
      if (controller) controller.abort();
    }

    function isOpen() {
      return !panel.hasAttribute('hidden');
    }

    function render(html) {
      results.innerHTML = html;
      results.scrollTop = 0;
    }

    function escapeHtml(value) {
      return value.replace(/[&<>"]/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character];
      });
    }

    /* Predictive results are an enhancement on top of a working search page —
       if the suggest call fails for any reason, still offer the way through
       rather than leaving an empty panel that looks broken. */
    function renderFallback(query, reason) {
      if (window.console && window.console.warn) {
        window.console.warn('[CWC] predictive search unavailable (' + reason + ')');
      }

      render(
        '<a class="cwc_search__view-all" href="' +
          root +
          'search?q=' +
          encodeURIComponent(query) +
          '" data-cwc-search-item>View all results for &ldquo;' +
          escapeHtml(query) +
          '&rdquo;</a>'
      );
    }

    var currency =
      (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD';

    /* prices arrive as major-unit strings ("42.99"), not cents */
    function money(value) {
      var amount = parseFloat(value);
      if (isNaN(amount)) return '';

      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: currency
        }).format(amount);
      } catch (error) {
        return '$' + amount.toFixed(2);
      }
    }

    /* the CDN honours a width param, so ask for a thumbnail not a 1080px hero */
    function thumbnail(url) {
      if (!url) return '';
      return url + (url.indexOf('?') === -1 ? '?' : '&') + 'width=120';
    }

    function group(title, links) {
      if (!links.length) return '';
      return (
        '<div class="cwc_search__group">' +
        '<p class="cwc_search__group-title">' + title + '</p>' +
        links.join('') +
        '</div>'
      );
    }

    function term(href, label) {
      return '<a href="' + href + '" class="cwc_search__term" data-cwc-search-item>' + label + '</a>';
    }

    function productRow(product) {
      var image = product.image || (product.featured_image && product.featured_image.url);
      var media = image
        ? '<img src="' + thumbnail(image) + '" alt="" loading="lazy" width="52" height="64">'
        : '';

      var wasPrice = parseFloat(product.compare_at_price_max || '0');
      var nowPrice = parseFloat(product.price || '0');
      var price = wasPrice > nowPrice ? '<s>' + money(wasPrice) + '</s>' + money(nowPrice) : money(nowPrice);

      return (
        '<a href="' + product.url + '" class="cwc_search__product" data-cwc-search-item>' +
        '<span class="cwc_search__product-media">' + media + '</span>' +
        '<span class="cwc_search__product-body">' +
        (product.vendor
          ? '<span class="cwc_search__product-brand">' + escapeHtml(product.vendor) + '</span>'
          : '') +
        '<span class="cwc_search__product-title">' + escapeHtml(product.title) + '</span>' +
        '<span class="cwc_search__product-price">' + price + '</span>' +
        '</span>' +
        '</a>'
      );
    }

    function build(results, query) {
      var queries = results.queries || [];
      var products = results.products || [];
      var collections = results.collections || [];

      /* Shopify has no vendor resource, so brands come from the matched
         products — keeping only vendors the query actually names. */
      var lowered = query.toLowerCase();
      var seen = {};
      var brands = [];

      products.forEach(function (product) {
        var vendor = product.vendor;
        if (!vendor || seen[vendor]) return;
        if (vendor.toLowerCase().indexOf(lowered) === -1) return;
        seen[vendor] = true;
        brands.push(vendor);
      });

      var side =
        group(
          'Suggestions',
          queries.slice(0, 6).map(function (item) {
            /* styled_text wraps the matched run in <mark> */
            return term(item.url, item.styled_text || escapeHtml(item.text));
          })
        ) +
        group(
          'Brands',
          brands.slice(0, 4).map(function (vendor) {
            return term(
              root + 'collections/vendors?q=' + encodeURIComponent(vendor),
              escapeHtml(vendor)
            );
          })
        ) +
        group(
          'Collections',
          collections.slice(0, 4).map(function (item) {
            return term(item.url, escapeHtml(item.title));
          })
        );

      var productList = products.length
        ? '<div class="cwc_search__products">' +
          '<p class="cwc_search__group-title">Products</p>' +
          products.slice(0, 6).map(productRow).join('') +
          '</div>'
        : '';

      if (!side && !productList) {
        return (
          '<p class="cwc_search__empty">No matches for &ldquo;' +
          escapeHtml(query) +
          '&rdquo;. Try a brand, style, or region.</p>'
        );
      }

      var single = side && productList ? '' : ' cwc_search__results--single';

      return (
        '<div class="cwc_search__results' + single + '">' +
        (side ? '<div class="cwc_search__side">' + side + '</div>' : '') +
        productList +
        '</div>' +
        '<a href="' + root + 'search?q=' + encodeURIComponent(query) +
        '" class="cwc_search__view-all" data-cwc-search-item>' +
        'View all results for &ldquo;' + escapeHtml(query) + '&rdquo;</a>'
      );
    }

    function search(query) {
      /* a query already in flight is stale the moment the next key lands */
      if (controller) controller.abort();
      controller = window.AbortController ? new window.AbortController() : null;

      /* the .json endpoint is served by Shopify itself — unlike section
         rendering there is no theme file that has to be present for it */
      var url =
        root +
        'search/suggest.json?q=' +
        encodeURIComponent(query) +
        '&resources[limit]=8&resources[limit_scope]=each' +
        '&resources[type]=query,product,collection';

      fetch(url, controller ? { signal: controller.signal } : undefined)
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (data) {
          /* the field moved on while this was in flight */
          if (input.value.trim() !== query) return;

          var results = (data && data.resources && data.resources.results) || {};
          render(build(results, query));
        })
        .catch(function (error) {
          if (error && error.name === 'AbortError') return;
          if (input.value.trim() !== query) return;
          renderFallback(query, (error && error.message) || 'request failed');
        });
    }

    function onInput() {
      var query = input.value.trim();
      if (query === lastQuery) return;
      lastQuery = query;

      window.clearTimeout(timer);

      if (query.length < SEARCH_MIN_LENGTH) {
        if (controller) controller.abort();
        render('');
        return;
      }

      timer = window.setTimeout(function () {
        search(query);
      }, SEARCH_DEBOUNCE);
    }

    /* roving focus through whatever the results happen to contain */
    function move(direction) {
      var items = Array.prototype.slice.call(results.querySelectorAll('[data-cwc-search-item]'));
      if (!items.length) return;

      var index = items.indexOf(document.activeElement);
      var nextIndex = index + direction;

      if (nextIndex < 0) {
        input.focus();
        return;
      }
      if (nextIndex >= items.length) nextIndex = items.length - 1;

      items[nextIndex].focus();
    }

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      if (isOpen()) {
        close();
      } else {
        open();
      }
    });

    if (closeButton) closeButton.addEventListener('click', close);

    input.addEventListener('input', onInput);

    panel.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        move(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'Escape') {
        close();
        toggle.focus();
      }
    });

    /* click anywhere outside the panel or the icon that opened it */
    document.addEventListener('click', function (event) {
      if (!isOpen()) return;
      if (panel.contains(event.target) || toggle.contains(event.target)) return;
      close();
    });

    document.addEventListener('focusin', function (event) {
      if (!isOpen()) return;
      if (panel.contains(event.target) || toggle.contains(event.target)) return;
      close();
    });
  }

  /* The theme's own header opens its cart drawer by emitting on the shared
     eventBus (see Header.onCartButtonClick in theme.js); component-cart-drawer
     listens for it. Match that rather than reaching into the component. */
  function initCartDrawer(sectionEl) {
    var cartLink = sectionEl.querySelector('[data-cwc-cart-drawer]');
    if (!cartLink) return;

    cartLink.addEventListener('click', function (event) {
      var bus = window.eventBus;
      var listeners = bus && bus.listeners && bus.listeners['open:cart:drawer'];

      /* nothing listening yet — leave the click alone so it falls through to
         the cart page rather than doing nothing at all */
      if (!listeners || listeners.size === 0) return;

      event.preventDefault();
      bus.emit('open:cart:drawer', { scrollToTop: false });
    });
  }

  function initCartCount(sectionEl) {
    var count = sectionEl.querySelector('[data-cwc-cart-count]');
    if (!count) return;

    function refresh() {
      fetch('/cart.js')
        .then(function (response) {
          if (!response.ok) throw new Error('Cart read failed');
          return response.json();
        })
        .then(function (cart) {
          count.textContent = cart.item_count;
          if (cart.item_count > 0) {
            count.removeAttribute('hidden');
          } else {
            count.setAttribute('hidden', '');
          }
        })
        .catch(function () {
          /* leave the server-rendered count in place */
        });
    }

    /* every CWC section that adds to cart fires this */
    document.addEventListener('cwc:cart:added', refresh);
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcHeaderInit === 'true') return;
    sectionEl.dataset.cwcHeaderInit = 'true';

    initDrawer(sectionEl);
    initSearch(sectionEl);
    initCartDrawer(sectionEl);
    initCartCount(sectionEl);
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
    var section = event.target.querySelector('.cwc_header');
    if (section) initSection(section);
  });
})();
