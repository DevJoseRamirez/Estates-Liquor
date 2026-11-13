/* ==============================
   CWC Build a Box Builder
   UI layer: shelf cards, tabs + search, tier cards, desktop panel, mobile bar
   + sheet, add-box-to-cart. All state lives in CWC_bab_store.js.
   ============================== */
(function () {
  'use strict';

  var GIFT_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="8" width="18" height="4" /><path d="M12 8v13M19 12v9H5v-9" />' +
    '<path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>';

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function initSection(sectionEl) {
    if (!sectionEl || !window.CWCBabStore) return;
    if (sectionEl.dataset.babReady === 'true') return;

    var configEl = sectionEl.querySelector('[data-bab-config]');
    if (!configEl) return;

    var config;
    try {
      config = JSON.parse(configEl.textContent);
    } catch (e) {
      return;
    }

    sectionEl.dataset.babReady = 'true';

    var store = window.CWCBabStore.create(config);
    var copy = store.copy; /* defaults merged with the non-blank section settings */

    var cards = Array.prototype.slice.call(sectionEl.querySelectorAll('[data-bab-card]'));
    var tierEls = Array.prototype.slice.call(sectionEl.querySelectorAll('[data-bab-tier]'));
    var tabs = Array.prototype.slice.call(sectionEl.querySelectorAll('[data-bab-tab]'));
    var searchInput = sectionEl.querySelector('[data-bab-search]');
    var resultsEl = sectionEl.querySelector('[data-bab-results]');
    var emptyEl = sectionEl.querySelector('[data-bab-empty]');
    var boxes = Array.prototype.slice.call(sectionEl.querySelectorAll('[data-bab-box]'));
    var bar = sectionEl.querySelector('[data-bab-bar]');
    var sheet = sectionEl.querySelector('[data-bab-sheet]');
    var lineTemplate = sectionEl.querySelector('[data-bab-line-template]');

    var cardById = {};
    cards.forEach(function (card) {
      card.dataset.searchNorm = normalize(card.dataset.search);
      cardById[card.dataset.variantId] = card;
    });

    var activeTabEl = tabs.filter(function (t) {
      return t.classList.contains('cwc_bab-builder__tab--active');
    })[0];
    var activeTab = activeTabEl ? activeTabEl.dataset.babTab : 'all';
    var query = '';
    var busy = false;

    function metaFromCard(card) {
      return {
        title: card.dataset.title,
        price: Number(card.dataset.price) || 0,
        max: Number(card.dataset.max),
        image: card.dataset.image || '',
        url: card.dataset.url || ''
      };
    }

    /* ---------- Shelf filtering ---------- */
    function applyFilter() {
      var q = normalize(query.trim());
      var visible = 0;
      cards.forEach(function (card) {
        var inTab = activeTab === 'all' || (card.dataset.tabs || '').indexOf(' ' + activeTab + ' ') > -1;
        var match = !q || card.dataset.searchNorm.indexOf(q) > -1;
        var show = inTab && match;
        card.hidden = !show;
        if (show) visible++;
      });

      if (resultsEl) {
        resultsEl.textContent =
          visible === 1 && copy.resultsOne ? copy.resultsOne : store.fill(copy.results, { count: visible });
      }
      if (emptyEl) {
        emptyEl.hidden = visible > 0;
        var clearBtn = emptyEl.querySelector('[data-bab-clear]');
        if (clearBtn) clearBtn.hidden = !q;
      }
    }

    function setTab(tabEl) {
      activeTab = tabEl.dataset.babTab;
      tabs.forEach(function (t) {
        var on = t === tabEl;
        t.classList.toggle('cwc_bab-builder__tab--active', on);
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyFilter();
    }

    /* ---------- Render ---------- */
    function renderCards() {
      cards.forEach(function (card) {
        var id = card.dataset.variantId;
        var qty = store.qty(id);
        var max = Number(card.dataset.max);
        var addBtn = card.querySelector('[data-bab-add]');
        var stepper = card.querySelector('[data-bab-stepper]');
        var badge = card.querySelector('[data-bab-in-box]');
        if (addBtn) addBtn.hidden = qty > 0;
        if (stepper) {
          stepper.hidden = qty === 0;
          var value = stepper.querySelector('[data-bab-qty]');
          if (value) value.textContent = store.fill(copy.inBox, { qty: qty });
          var inc = stepper.querySelector('[data-bab-inc]');
          if (inc) inc.disabled = isFinite(max) && qty >= max;
        }
        if (badge) badge.hidden = qty === 0;
        card.classList.toggle('cwc_bab-builder__card--in-box', qty > 0);
      });
    }

    function renderTiers(states) {
      var byIdx = {};
      states.forEach(function (s) {
        byIdx[s.idx] = s;
      });

      tierEls.forEach(function (el) {
        var s = byIdx[el.dataset.tier];
        if (!s) return;
        ['next', 'active', 'upgraded', 'locked'].forEach(function (name) {
          el.classList.toggle('cwc_bab-builder__tier--' + name, s.status === name);
        });
        var label = el.querySelector('[data-bab-tier-status]');
        if (!label) return;
        if (s.status === 'active') label.textContent = copy.tierActive || 'In your box';
        else if (s.status === 'upgraded') label.textContent = copy.tierUpgraded || 'Upgraded';
        else if (s.status === 'locked') label.textContent = copy.tierLocked || 'Locked';
        else if (s.toGo !== null) label.textContent = store.fill(copy.tierToGo || '[amount] to go', { amount: store.money(s.toGo) });
        else label.textContent = copy.tierNext || 'Next';
      });

      sectionEl.querySelectorAll('[data-bab-marker]').forEach(function (marker) {
        var s = byIdx[marker.dataset.tier];
        marker.classList.toggle('cwc_bab-builder__progress-marker--on', Boolean(s && s.reached));
      });
    }

    function renderLines(list) {
      var lines = store.lines();
      var existing = {};
      Array.prototype.forEach.call(list.children, function (li) {
        existing[li.dataset.variantId] = li;
      });

      lines.forEach(function (line, i) {
        var li = existing[line.id];
        if (!li) {
          if (!lineTemplate) return;
          li = lineTemplate.content.firstElementChild.cloneNode(true);
          li.dataset.variantId = line.id;
        }
        delete existing[line.id];

        var img = li.querySelector('img');
        if (img) {
          if (line.image) {
            if (img.getAttribute('src') !== line.image) img.src = line.image;
            img.alt = line.title || '';
            img.hidden = false;
          } else {
            img.hidden = true;
          }
        }
        var title = li.querySelector('[data-bab-line-title]');
        if (title) title.textContent = line.title || '';
        var qty = li.querySelector('[data-bab-qty]');
        if (qty) qty.textContent = line.qty;
        var price = li.querySelector('[data-bab-line-price]');
        if (price) price.textContent = store.money(line.price * line.qty);
        var inc = li.querySelector('[data-bab-inc]');
        if (inc) {
          inc.disabled = isFinite(line.max) && line.qty >= line.max;
          inc.setAttribute('aria-label', 'Add one more ' + (line.title || ''));
        }
        var dec = li.querySelector('[data-bab-dec]');
        if (dec) dec.setAttribute('aria-label', 'Remove one ' + (line.title || ''));
        var remove = li.querySelector('[data-bab-remove]');
        if (remove) remove.setAttribute('aria-label', 'Remove ' + (line.title || '') + ' from box');
        var note = li.querySelector('[data-bab-line-note]');
        if (note) {
          note.hidden = !line.capped;
          note.textContent = line.capped ? store.fill(copy.onlyLeft || 'Only [qty] left', { qty: line.max }) : '';
        }

        if (list.children[i] !== li) list.insertBefore(li, list.children[i] || null);
      });

      Object.keys(existing).forEach(function (id) {
        if (existing[id].dataset.variantId) existing[id].remove();
      });

      var emptyNote = list.querySelector('[data-bab-empty-line]');
      if (!lines.length) {
        if (!emptyNote) {
          emptyNote = document.createElement('li');
          emptyNote.className = 'cwc_bab-builder__line-empty';
          emptyNote.setAttribute('data-bab-empty-line', '');
          emptyNote.textContent = copy.emptyBox || '';
          list.appendChild(emptyNote);
        }
      } else if (emptyNote) {
        emptyNote.remove();
      }
    }

    function renderReward(box, p) {
      var el = box.querySelector('[data-bab-reward]');
      if (!el) return;
      var tier = p.activeTier;
      el.hidden = !tier;
      if (!tier) return;

      var media = el.querySelector('[data-bab-reward-media]');
      if (media) {
        if (tier.image) {
          media.innerHTML = '';
          var img = document.createElement('img');
          img.src = tier.image;
          img.alt = '';
          img.width = 56;
          img.height = 56;
          media.appendChild(img);
          media.classList.remove('cwc_bab-builder__reward-media--icon');
        } else {
          media.innerHTML = GIFT_ICON;
          media.classList.add('cwc_bab-builder__reward-media--icon');
        }
      }

      var label = el.querySelector('[data-bab-reward-label]');
      if (label) label.textContent = store.fill(copy.rewardLabel || 'Box reward · [tier] tier', { tier: tier.label });
      var name = el.querySelector('[data-bab-reward-name]');
      if (name) name.textContent = tier.name;

      var price = el.querySelector('[data-bab-reward-price]');
      var was = el.querySelector('[data-bab-reward-was]');
      var adj = store.rewardAdjustment(tier, p.subtotal);
      if (price) {
        if (tier.type === 'gift') price.textContent = copy.free || 'Free';
        else if (adj < 0) price.textContent = '−' + store.money(-adj);
        else price.textContent = store.money(adj);
      }
      if (was) {
        var showWas = !store.isDiscountType(tier) && tier.regular > 0;
        was.hidden = !showWas;
        was.textContent = showWas ? store.money(tier.regular) : '';
      }
    }

    function buttonLabel(p) {
      if (p.count === 0) return store.fill(copy.buttonEmpty, { min: store.minBottles, bottles: store.plural(store.minBottles) });
      if (!p.eligible) return store.fill(copy.buttonFew, { remaining: p.remaining, bottles: store.plural(p.remaining) });
      return store.fill(copy.buttonActive, { total: store.money(store.total()) });
    }

    function render() {
      var p = store.progress();
      var st = store.status();

      renderCards();
      renderTiers(store.tierStates());

      sectionEl.querySelectorAll('[data-bab-status]').forEach(function (el) {
        el.textContent = st.bold;
      });
      sectionEl.querySelectorAll('[data-bab-sub]').forEach(function (el) {
        el.textContent = st.sub;
        el.hidden = !st.sub;
      });
      sectionEl.querySelectorAll('[data-bab-fill]').forEach(function (el) {
        el.style.width = p.percent + '%';
      });
      sectionEl.querySelectorAll('[data-bab-count]').forEach(function (el) {
        el.textContent = p.count;
      });

      boxes.forEach(function (box) {
        var list = box.querySelector('[data-bab-lines]');
        if (list) renderLines(list);
        renderReward(box, p);

        var totalEl = box.querySelector('[data-bab-total]');
        if (totalEl) totalEl.textContent = store.money(p.eligible ? store.total() : p.subtotal);
        var totalLabel = box.querySelector('[data-bab-total-label]');
        if (totalLabel) {
          totalLabel.textContent = store.isDiscountType(p.activeTier)
            ? copy.estTotalLabel || 'Est. box total'
            : copy.totalLabel || 'Box total';
        }
        var submit = box.querySelector('[data-bab-submit]');
        if (submit && !busy) {
          submit.disabled = !p.eligible;
          submit.textContent = buttonLabel(p);
        }
      });

      if (bar) {
        var bottles = bar.querySelector('[data-bab-bottles]');
        if (bottles) bottles.textContent = store.fill(copy.bottlesInBox || '[count] [bottles] in box', { count: p.count, bottles: store.plural(p.count) });
        var sub = bar.querySelector('[data-bab-subtotal]');
        if (sub) sub.textContent = store.money(p.subtotal);
      }
    }

    /* ---------- Box actions ---------- */
    function change(id, delta) {
      var card = cardById[id];
      var meta = card ? metaFromCard(card) : null;
      store.setQty(id, store.qty(id) + delta, meta);
    }

    function showError(message) {
      sectionEl.querySelectorAll('[data-bab-error]').forEach(function (el) {
        el.textContent = message || '';
        el.hidden = !message;
      });
    }

    function setBusy(on) {
      busy = on;
      sectionEl.querySelectorAll('[data-bab-submit]').forEach(function (btn) {
        btn.disabled = on || !store.progress().eligible;
        if (on) btn.textContent = copy.buttonAdding || 'Adding…';
      });
      if (!on) render();
    }

    function openCartDrawer() {
      var bus = window.eventBus;
      var listeners = bus && bus.listeners && bus.listeners['open:cart:drawer'];
      if (!listeners || listeners.size === 0) return false;
      bus.emit('render:cart:drawer');
      bus.emit('open:cart:drawer', { scrollToTop: true });
      return true;
    }

    function cartRequest(url, body) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      }).then(function (res) {
        return res.json().then(function (json) {
          if (!res.ok) {
            var err = new Error(json.description || json.message || 'Cart error');
            err.data = json;
            throw err;
          }
          return json;
        });
      });
    }

    function root() {
      return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    }

    function addBoxToCart() {
      if (busy || !store.progress().eligible) return;
      setBusy(true);
      showError('');

      var boxId = 'box-' + Date.now().toString(36);

      fetch(root() + 'cart.js', { headers: { Accept: 'application/json' } })
        .then(function (res) {
          return res.json();
        })
        .then(function (cart) {
          /* One box per cart: clear the previous box's lines first */
          var updates = {};
          var hasOld = false;
          (cart.items || []).forEach(function (item) {
            if (item.properties && item.properties._bab_box) {
              updates[item.key] = 0;
              hasOld = true;
            }
          });
          return hasOld ? cartRequest(root() + 'cart/update.js', { updates: updates }) : null;
        })
        .then(function () {
          return cartRequest(root() + 'cart/add.js', { items: store.cartItems(boxId) });
        })
        .then(function () {
          document.dispatchEvent(new CustomEvent('cwc:cart:added', { bubbles: true }));
          if (sheet && sheet.open) sheet.close();
          setBusy(false);
          if (!openCartDrawer()) window.location.href = root() + 'cart';
        })
        .catch(function (err) {
          setBusy(false);
          showError((err && err.data && err.data.description) || copy.addError || 'Something went wrong. Please try again.');
        });
    }

    /* "Edit box" from the cart: ?edit=1 rebuilds the box from the cart lines */
    function loadFromCart() {
      return fetch(root() + 'cart.js', { headers: { Accept: 'application/json' } })
        .then(function (res) {
          return res.json();
        })
        .then(function (cart) {
          var byId = {};
          (cart.items || []).forEach(function (item) {
            var props = item.properties || {};
            if (props._bab_role !== 'item') return;
            var id = String(item.variant_id);
            if (!byId[id]) {
              byId[id] = {
                id: id,
                qty: 0,
                meta: {
                  title: item.product_title,
                  price: item.price,
                  max: 99,
                  image: item.image ? item.image + (item.image.indexOf('?') > -1 ? '&' : '?') + 'width=160' : '',
                  url: item.url
                }
              };
            }
            byId[id].qty += item.quantity;
          });
          var entries = Object.keys(byId).map(function (id) {
            return byId[id];
          });
          if (entries.length) store.replaceAll(entries);
        })
        .catch(function () {
          /* keep whatever box the session already had */
        });
    }

    function liveShelf() {
      var live = {};
      cards.forEach(function (card) {
        if (!card.querySelector('[data-bab-add]')) return; /* sold out */
        live[card.dataset.variantId] = metaFromCard(card);
      });
      return live;
    }

    /* ---------- Events ---------- */
    sectionEl.addEventListener('click', function (event) {
      var target = event.target;

      if (sheet && target === sheet) {
        sheet.close();
        return;
      }

      var btn = target.closest('button');
      if (!btn || !sectionEl.contains(btn)) return;

      var holder = btn.closest('[data-variant-id]');
      var id = holder ? holder.dataset.variantId : null;

      if (btn.hasAttribute('data-bab-add') && id) change(id, 1);
      else if (btn.hasAttribute('data-bab-inc') && id) change(id, 1);
      else if (btn.hasAttribute('data-bab-dec') && id) change(id, -1);
      else if (btn.hasAttribute('data-bab-remove') && id) store.setQty(id, 0);
      else if (btn.hasAttribute('data-bab-tab')) setTab(btn);
      else if (btn.hasAttribute('data-bab-clear')) {
        query = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        applyFilter();
      } else if (btn.hasAttribute('data-bab-open')) {
        if (sheet && typeof sheet.showModal === 'function') sheet.showModal();
      } else if (btn.hasAttribute('data-bab-close')) {
        if (sheet && sheet.open) sheet.close();
      } else if (btn.hasAttribute('data-bab-submit')) {
        addBoxToCart();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        query = searchInput.value;
        applyFilter();
      });
    }

    /* Keep page content clear of the fixed mobile bar */
    var resizeObserver = null;
    if (bar) {
      document.body.classList.add('cwc_bab-has-bar');
      var setBarHeight = function () {
        document.documentElement.style.setProperty('--cwc-bab-bar-height', bar.offsetHeight + 'px');
      };
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(setBarHeight);
        resizeObserver.observe(bar);
      }
      setBarHeight();
    }

    sectionEl._babDestroy = function () {
      document.body.classList.remove('cwc_bab-has-bar');
      if (resizeObserver) resizeObserver.disconnect();
    };

    store.subscribe(render);

    var params = new URLSearchParams(window.location.search);
    var start = params.has('edit') ? loadFromCart() : Promise.resolve();
    start.then(function () {
      store.reconcile(liveShelf());
      if (params.has('edit') && window.history.replaceState) {
        params.delete('edit');
        var qs = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
      }
    });

    applyFilter();
    render();
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_bab-builder').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_bab-builder');
    if (section) initSection(section);
  });

  document.addEventListener('shopify:section:unload', function (event) {
    var section = event.target.querySelector('.cwc_bab-builder');
    if (section && section._babDestroy) section._babDestroy();
  });
})();
