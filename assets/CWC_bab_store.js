/* ==============================
   CWC Build a Box: Store
   Pure box state: contents, tier maths, status copy, persistence and the cart
   payload. No DOM. CWC_bab_builder.js renders from it.
   Exposes window.CWCBabStore.create(config).
   ============================== */
(function () {
  'use strict';

  if (window.CWCBabStore) return;

  var DEFAULT_COPY = {
    emptyBold: 'Start your box',
    emptySub: 'Add [min] or more bottles to unlock rewards.',
    fewBold: 'Add [remaining] more [bottles]',
    fewSub: 'Boxes start at [min] bottles.',
    underBold: '[amount] to go',
    underSub: 'Unlock [reward] [reward_price].',
    reachedBold: '[reward] added [reward_price]',
    reachedSub: '[amount] more upgrades it to [next_reward].',
    topBold: 'Top reward unlocked',
    topSub: '[reward] added [reward_price].',
    noTiersBold: 'Your box is ready',
    tierNext: 'Next',
    tierToGo: '[amount] to go',
    tierActive: 'In your box',
    tierUpgraded: 'Upgraded',
    tierLocked: 'Locked',
    buttonEmpty: 'Add [min] bottles to start',
    buttonFew: 'Add [remaining] more [bottles]',
    buttonActive: 'Add box to cart · [total]',
    buttonAdding: 'Adding…',
    inBox: '[qty] in box',
    bottlesInBox: '[count] [bottles] in box',
    results: '[count] bottles in this offer',
    resultsOne: '1 bottle in this offer',
    rewardLabel: 'Box reward · [tier] tier',
    free: 'Free',
    totalLabel: 'Box total',
    estTotalLabel: 'Est. box total',
    onlyLeft: 'Only [qty] left',
    emptyBox: 'Your box is empty. Add bottles from the shelf.',
    addError: 'Something went wrong adding your box. Please try again.'
  };

  /* ---------- Money ---------- */
  function formatMoney(cents, format) {
    cents = Math.round(Number(cents) || 0);
    format = format || '${{amount}}';
    var match = format.match(/\{\{\s*(\w+)\s*\}\}/);
    var key = match ? match[1] : 'amount';

    function fmt(value, decimals, thousands, decimal) {
      var parts = (value / 100).toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts.length > 1 ? parts[0] + decimal + parts[1] : parts[0];
    }

    var out;
    switch (key) {
      case 'amount_no_decimals':
        out = fmt(cents, 0, ',', '.');
        break;
      case 'amount_with_comma_separator':
        out = fmt(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        out = fmt(cents, 0, '.', ',');
        break;
      case 'amount_with_apostrophe_separator':
        out = fmt(cents, 2, "'", '.');
        break;
      default:
        out = fmt(cents, 2, ',', '.');
    }
    return format.replace(/\{\{\s*\w+\s*\}\}/, out).replace(/<[^>]*>/g, '');
  }

  function fillTokens(template, tokens) {
    if (!template) return '';
    var out = String(template).replace(/\[(\w+)\]/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(tokens, name) ? tokens[name] : whole;
    });
    /* An empty token (e.g. [reward_price] on a $-off tier) leaves stray spaces */
    return out.replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
  }

  function plural(n) {
    return n === 1 ? 'bottle' : 'bottles';
  }

  /* ---------- Store ---------- */
  function create(config) {
    config = config || {};
    var copy = {};
    var k;
    for (k in DEFAULT_COPY) copy[k] = DEFAULT_COPY[k];
    for (k in config.copy || {}) {
      if (config.copy[k]) copy[k] = config.copy[k];
    }

    var minBottles = Math.max(1, Number(config.minBottles) || 2);
    var moneyFormat = config.moneyFormat;
    var storageKey = 'cwc_bab_' + (config.storageKey || 'box');
    var tiers = (config.tiers || []).slice().sort(function (a, b) {
      return a.threshold - b.threshold;
    });
    var topThreshold = tiers.length ? tiers[tiers.length - 1].threshold : 0;

    var state = { items: {}, order: [] };
    var listeners = [];

    load();

    function load() {
      try {
        var raw = window.sessionStorage.getItem(storageKey);
        if (!raw) return;
        var saved = JSON.parse(raw);
        if (!saved || !saved.items) return;
        state.items = saved.items;
        state.order = (saved.order || Object.keys(saved.items)).filter(function (id) {
          return state.items[id] && state.items[id].qty > 0;
        });
      } catch (e) {
        state = { items: {}, order: [] };
      }
    }

    function save() {
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        /* private mode / storage blocked: the box still works for this visit */
      }
    }

    function emit() {
      save();
      listeners.forEach(function (fn) {
        fn(api);
      });
    }

    function capOf(item) {
      var max = Number(item.max);
      return isFinite(max) && max >= 0 ? max : 99;
    }

    /* Set an item's quantity. meta (title, price, image, max, url) is merged in. */
    function setQty(id, qty, meta, silent) {
      id = String(id);
      var item = state.items[id];
      if (meta) {
        item = state.items[id] = Object.assign({}, item || {}, meta);
      }
      if (!item) return;

      qty = Math.max(0, Math.min(Math.floor(qty), capOf(item)));
      if (qty === 0) {
        delete state.items[id];
        state.order = state.order.filter(function (x) {
          return x !== id;
        });
      } else {
        item.qty = qty;
        if (state.order.indexOf(id) === -1) state.order.push(id);
      }
      if (!silent) emit();
    }

    function qtyOf(id) {
      var item = state.items[String(id)];
      return item ? item.qty : 0;
    }

    function lines() {
      return state.order.map(function (id) {
        return Object.assign({ id: id }, state.items[id]);
      });
    }

    function count() {
      return lines().reduce(function (n, line) {
        return n + line.qty;
      }, 0);
    }

    function subtotal() {
      return lines().reduce(function (sum, line) {
        return sum + (Number(line.price) || 0) * line.qty;
      }, 0);
    }

    /* Refresh live price / stock from the shelf; drop bottles no longer in the
       offer; cap quantities at stock (and flag the line). */
    function reconcile(live) {
      state.order.slice().forEach(function (id) {
        var info = live[id];
        if (!info) {
          setQty(id, 0, null, true);
          return;
        }
        var item = state.items[id];
        var wanted = item.qty;
        Object.assign(item, info);
        item.capped = wanted > capOf(item);
        setQty(id, wanted, null, true);
      });
      emit();
    }

    function replaceAll(entries) {
      state = { items: {}, order: [] };
      entries.forEach(function (entry) {
        setQty(entry.id, entry.qty, entry.meta, true);
      });
      emit();
    }

    function clear() {
      state = { items: {}, order: [] };
      emit();
    }

    /* ---------- Tiers ---------- */
    function progress() {
      var c = count();
      var s = subtotal();
      var eligible = c >= minBottles;
      var active = -1;
      if (eligible) {
        tiers.forEach(function (tier, i) {
          if (s >= tier.threshold) active = i;
        });
      }
      var next = -1;
      if (!eligible) {
        next = tiers.length ? 0 : -1;
      } else if (active + 1 < tiers.length) {
        next = active + 1;
      }
      var activeTier = active > -1 ? tiers[active] : null;
      var nextTier = next > -1 ? tiers[next] : null;

      return {
        count: c,
        subtotal: s,
        eligible: eligible,
        remaining: Math.max(0, minBottles - c),
        active: active,
        next: next,
        activeTier: activeTier,
        nextTier: nextTier,
        toNext: nextTier ? Math.max(0, nextTier.threshold - s) : 0,
        percent: topThreshold ? Math.min(100, (s / topThreshold) * 100) : 0
      };
    }

    /* One entry per tier (keyed by idx = order on the page) */
    function tierStates() {
      var p = progress();
      return tiers.map(function (tier, i) {
        var status = 'locked';
        if (!p.eligible) {
          status = i === 0 ? 'next' : 'locked';
        } else if (i === p.active) {
          status = 'active';
        } else if (i < p.active) {
          status = 'upgraded';
        } else if (i === p.next) {
          status = 'next';
        }
        return {
          idx: tier.idx,
          threshold: tier.threshold,
          status: status,
          toGo: status === 'next' && p.eligible ? Math.max(0, tier.threshold - p.subtotal) : null,
          reached: p.eligible && p.subtotal >= tier.threshold
        };
      });
    }

    /* Signed effect of the reward on the box total, in cents */
    function rewardAdjustment(tier, sub) {
      if (!tier) return 0;
      switch (tier.type) {
        case 'product_price':
          return Number(tier.price) || 0;
        case 'gift':
          return 0;
        case 'amount_off':
          return -Math.min(sub, Math.round((Number(tier.value) || 0) * 100));
        case 'percent_off':
          return -Math.round((sub * (Number(tier.value) || 0)) / 100);
        default:
          return 0;
      }
    }

    function isDiscountType(tier) {
      return Boolean(tier) && (tier.type === 'amount_off' || tier.type === 'percent_off');
    }

    function total() {
      var p = progress();
      return Math.max(0, p.subtotal + rewardAdjustment(p.activeTier, p.subtotal));
    }

    /* ---------- Copy ---------- */
    function status() {
      var p = progress();
      var tokens = {
        min: minBottles,
        remaining: p.remaining,
        bottles: plural(p.remaining),
        count: p.count,
        amount: money(p.toNext),
        reward: p.activeTier ? p.activeTier.name : p.nextTier ? p.nextTier.name : '',
        reward_price: p.activeTier ? p.activeTier.pricePhrase : p.nextTier ? p.nextTier.pricePhrase : '',
        next_reward: p.nextTier ? p.nextTier.name : ''
      };

      var bold;
      var sub;
      if (p.count === 0) {
        bold = copy.emptyBold;
        sub = copy.emptySub;
      } else if (!p.eligible) {
        bold = copy.fewBold;
        sub = copy.fewSub;
      } else if (!tiers.length) {
        bold = copy.noTiersBold;
        sub = '';
      } else if (!p.activeTier) {
        bold = copy.underBold;
        sub = copy.underSub;
      } else if (p.nextTier) {
        bold = copy.reachedBold;
        sub = copy.reachedSub;
      } else {
        bold = copy.topBold;
        sub = copy.topSub;
      }
      return { bold: fillTokens(bold, tokens), sub: fillTokens(sub, tokens) };
    }

    function money(cents) {
      return formatMoney(cents, moneyFormat);
    }

    /* ---------- Cart payload ---------- */
    function cartItems(boxId) {
      var p = progress();
      var tierLabel = p.activeTier ? p.activeTier.label : '';
      var items = lines().map(function (line) {
        var props = { _bab_box: boxId, _bab_role: 'item' };
        if (tierLabel) props._bab_tier = tierLabel;
        return { id: Number(line.id), quantity: line.qty, properties: props };
      });
      if (p.activeTier && p.activeTier.variantId && !isDiscountType(p.activeTier)) {
        items.push({
          id: Number(p.activeTier.variantId),
          quantity: 1,
          properties: { _bab_box: boxId, _bab_role: 'reward', _bab_tier: tierLabel }
        });
      }
      return items;
    }

    var api = {
      minBottles: minBottles,
      tiers: tiers,
      copy: copy,
      money: money,
      fill: fillTokens,
      plural: plural,
      setQty: setQty,
      qty: qtyOf,
      lines: lines,
      count: count,
      subtotal: subtotal,
      total: total,
      progress: progress,
      tierStates: tierStates,
      rewardAdjustment: rewardAdjustment,
      isDiscountType: isDiscountType,
      status: status,
      cartItems: cartItems,
      reconcile: reconcile,
      replaceAll: replaceAll,
      clear: clear,
      subscribe: function (fn) {
        listeners.push(fn);
        return function () {
          listeners = listeners.filter(function (x) {
            return x !== fn;
          });
        };
      }
    };
    return api;
  }

  window.CWCBabStore = { create: create, formatMoney: formatMoney };
})();
