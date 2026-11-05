(function () {
  "use strict";

  /* The product form posts to /cart/add on its own, so with this file blocked
     the buy box still adds to cart via a normal form submit. */

  function moneyFormat(cents) {
    var format =
      (window.Shopify &&
        window.Shopify.currency &&
        window.Shopify.currency.active) ||
      "USD";
    try {
      return new Intl.NumberFormat(document.documentElement.lang || "en-US", {
        style: "currency",
        currency: format,
      }).format(cents / 100);
    } catch (e) {
      return "$" + (cents / 100).toFixed(2);
    }
  }

  function addItems(items) {
    return fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items }),
    }).then(function (response) {
      if (!response.ok) throw new Error("Add to cart failed");
      return response.json();
    });
  }

  /* The theme's cart drawer listens on the shared eventBus — re-render it with
     the new line, then open it. Returns false when nothing is listening, so
     the caller can fall back to the cart page instead of doing nothing. */
  function openCartDrawer() {
    var bus = window.eventBus;
    var listeners = bus && bus.listeners && bus.listeners["open:cart:drawer"];
    if (!listeners || listeners.size === 0) return false;

    bus.emit("render:cart:drawer");
    bus.emit("open:cart:drawer", { scrollToTop: true });
    return true;
  }

  function afterAdd(button, originalLabel) {
    document.dispatchEvent(
      new CustomEvent("cwc:cart:added", { bubbles: true }),
    );

    if (openCartDrawer()) {
      button.textContent = originalLabel;
      return;
    }

    /* No drawer on this theme — confirm inline rather than navigating away. */
    button.textContent = "Added";
    window.setTimeout(function () {
      button.textContent = originalLabel;
    }, 1600);
  }

  /* Gallery: a scroll-snap track of slides. Thumbs (desktop) and progress bars
     (tablet/mobile) follow the track as it scrolls or swipes; a thumb click or
     a variant change scrolls the track to that image. */
  function initGallery(sectionEl) {
    var track = sectionEl.querySelector("[data-cwc-gallery-track]");
    if (!track) return;

    var slides = Array.prototype.slice.call(track.querySelectorAll("[data-cwc-slide]"));
    var thumbs = Array.prototype.slice.call(sectionEl.querySelectorAll("[data-cwc-thumb]"));
    var dots = Array.prototype.slice.call(sectionEl.querySelectorAll("[data-cwc-dot]"));
    if (slides.length < 2) return;

    var current = 0;

    function setActive(index) {
      current = index;
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("cwc_product-buy-box__thumb--active", i === index);
        if (i === index) {
          thumb.setAttribute("aria-current", "true");
        } else {
          thumb.removeAttribute("aria-current");
        }
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("cwc_product-buy-box__dot--active", i === index);
      });
    }

    function goTo(index) {
      var slide = slides[index];
      if (!slide) return;
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
      setActive(index);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        goTo(parseInt(thumb.dataset.index, 10) || 0);
      });
    });

    var frame = null;
    track.addEventListener(
      "scroll",
      function () {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = null;
          var width = track.clientWidth || 1;
          setActive(Math.round(track.scrollLeft / width));
        });
      },
      { passive: true }
    );

    /* A resize changes the slide width, so re-pin the slide being shown */
    window.addEventListener("resize", function () {
      var slide = slides[current];
      if (slide) track.scrollLeft = slide.offsetLeft - track.offsetLeft;
    });

    /* Show the variant's own image when one is picked */
    var select = sectionEl.querySelector("[data-cwc-variant-select]");
    if (select) {
      select.addEventListener("change", function () {
        var option = select.options[select.selectedIndex];
        var mediaId = option && option.dataset.mediaId;
        if (!mediaId) return;
        var index = slides.findIndex(function (s) {
          return s.dataset.mediaId === String(mediaId);
        });
        if (index > -1) goTo(index);
      });
    }
  }

  function initQuantity(sectionEl) {
    var input = sectionEl.querySelector("[data-cwc-qty-input]");
    if (!input) return;

    sectionEl.querySelectorAll("[data-cwc-qty]").forEach(function (button) {
      button.addEventListener("click", function () {
        var step = parseInt(button.dataset.cwcQty, 10) || 0;
        var next = (parseInt(input.value, 10) || 1) + step;
        input.value = next < 1 ? 1 : next;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  function initVariantSelect(sectionEl) {
    var select = sectionEl.querySelector("[data-cwc-variant-select]");
    if (!select) return;

    /* Keep the URL in step with the chosen variant so a refresh or a share
       lands on the same one. */
    select.addEventListener("change", function () {
      var url = new URL(window.location.href);
      url.searchParams.set("variant", select.value);
      window.history.replaceState({}, "", url.toString());
    });
  }

  function initAddToCart(sectionEl) {
    var form = sectionEl.querySelector('form[action*="/cart/add"]');
    var button = sectionEl.querySelector("[data-cwc-atc]");
    if (!form || !button) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var variantField = form.querySelector('[name="id"]');
      var qtyField = form.querySelector('[name="quantity"]');
      if (!variantField) return;

      var original = button.textContent;
      button.classList.add("cwc_product-buy-box__atc--loading");

      addItems([
        {
          id: variantField.value,
          quantity: parseInt(qtyField ? qtyField.value : 1, 10) || 1,
        },
      ])
        .then(function () {
          button.classList.remove("cwc_product-buy-box__atc--loading");
          afterAdd(button, original);
        })
        .catch(function () {
          /* Report it here — posting the form would bounce the shopper to the
             cart page, which is the behaviour this replaces. */
          button.classList.remove("cwc_product-buy-box__atc--loading");
          button.textContent = "Try Again";
          window.setTimeout(function () {
            button.textContent = original;
          }, 2000);
        });
    });
  }

  /* Add-ons are never companions — same exclusion the cart drawer applies */
  var FBT_EXCLUDED_HANDLES = ["shipping-protection"];

  var FBT_ENDPOINT =
    "https://cdn.codeblackbelt.com/public/api/v1/frequently-bought-together";

  /* The endpoint answers no-store, so nothing is cached between us and them and
     every uncached page view spends from the shop's per-minute quota. One entry
     per product, half a day, keeps a busy product page to a single call. */
  var FBT_CACHE_PREFIX = "cwc:fbt:";
  var FBT_CACHE_TTL = 12 * 60 * 60 * 1000;

  function fbtCacheRead(productId) {
    /* Merchants need to see live data while editing, never a stale copy */
    if (window.Shopify && window.Shopify.designMode) return null;

    try {
      var raw = window.localStorage.getItem(FBT_CACHE_PREFIX + productId);
      if (!raw) return null;

      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.handles) return null;
      if (Date.now() - parsed.time > FBT_CACHE_TTL) return null;

      return parsed.handles;
    } catch (e) {
      return null;
    }
  }

  function fbtCacheWrite(productId, handles) {
    /* Never cache an empty answer. The app can be mid-index, or briefly out of
       data for a product — writing that would pin the block shut for half a day
       with no retry, which looks exactly like a broken block. */
    if (!handles.length) return;

    try {
      window.localStorage.setItem(
        FBT_CACHE_PREFIX + productId,
        JSON.stringify({ time: Date.now(), handles: handles }),
      );
    } catch (e) {
      /* private mode or a full quota — the fetch still worked, just uncached */
    }
  }

  function fbtFetchHandles(productId, shop) {
    var cached = fbtCacheRead(productId);
    /* an empty array is truthy — check the contents, not the object */
    if (cached && cached.length) return Promise.resolve(cached);

    var url =
      FBT_ENDPOINT +
      "?productId=" +
      encodeURIComponent(productId) +
      "&shop=" +
      encodeURIComponent(shop);

    return fetch(url)
      .then(function (response) {
        /* 429 once the shop's quota is spent — treat like any other miss */
        if (!response.ok) throw new Error("Recommendations unavailable");
        return response.json();
      })
      .then(function (data) {
        var list = (data && data.recommendations) || [];
        var handles = list
          .map(function (item) {
            return item.handle;
          })
          .filter(function (handle) {
            return handle && FBT_EXCLUDED_HANDLES.indexOf(handle) === -1;
          });

        fbtCacheWrite(productId, handles);
        return handles;
      });
  }

  /* The API answers with ids and handles only, so each one needs a second trip
     for the title, price, image and variant the row actually renders. */
  function fbtHydrate(handles) {
    return Promise.all(
      handles.map(function (handle) {
        return fetch("/products/" + handle + ".js")
          .then(function (response) {
            return response.ok ? response.json() : null;
          })
          .catch(function () {
            return null;
          });
      }),
    );
  }

  function fbtThumbUrl(url) {
    if (!url) return "";
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "width=120";
  }

  /* The bundle discount belongs to the Frequently Bought Together app: each
     click has it mint a one-off code scoped to exactly the checked products,
     which is then applied to the cart. This mirrors what the app's own widget
     does — it is the app's storefront API, not a documented one, so every
     step here fails soft and the items still go in the cart without it. */
  var FBT_APP_BASE = "https://cdn.codeblackbelt.com";

  function fbtMarket() {
    var shopify = window.Shopify || {};
    return {
      country: shopify.country || "",
      currency: (shopify.currency && shopify.currency.active) || "",
    };
  }

  /* The signature that authorises creating a code comes with the app's
     preferences for this page, so they are loaded once per page view */
  function fbtLoadDiscountPrefs(productId, shop) {
    var market = fbtMarket();
    var params = new URLSearchParams({
      productId: productId,
      shop: shop,
      marketCountry: market.country,
      marketCurrency: market.currency,
      path: location.pathname,
      version: new Date().toISOString().slice(0, 16).replace(/[-:T]/g, ""),
    });

    return fetch(
      FBT_APP_BASE +
        "/json/preferences/frequently-bought-together.json?" +
        params.toString(),
      { headers: { Accept: "application/json" } },
    )
      .then(function (response) {
        if (!response.ok) throw new Error("Discount preferences unavailable");
        return response.json();
      })
      .then(function (data) {
        var prefs = data && data.preferences && data.preferences[0];
        if (!prefs || !prefs.offer_discount || !prefs.discount_hmac) {
          return null;
        }
        return {
          hmac: prefs.discount_hmac,
          timestamp: prefs.discount_timestamp,
          path: prefs.path,
          /* in cents, like every other amount in this file */
          minimum: Math.round(
            (Number(prefs.discount_minimum_amount_requirement) || 0) * 100,
          ),
        };
      });
  }

  function fbtCreateDiscountCode(prefs, shop, bundle) {
    var market = fbtMarket();
    var params = new URLSearchParams({
      shop: shop,
      marketCountry: market.country,
      marketCurrency: market.currency,
      hmac: prefs.hmac,
      timestamp: prefs.timestamp,
      path: prefs.path,
      currentProductId: bundle.currentProductId,
    });
    bundle.productIds.forEach(function (id, i) {
      params.append("productIds[" + i + "]", id);
    });
    bundle.selectedProductIds.forEach(function (id, i) {
      params.append("selectedProductIds[" + i + "]", id);
    });
    bundle.selectedVariantIds.forEach(function (id, i) {
      params.append("selectedVariantIds[" + i + "]", id);
    });

    return fetch(FBT_APP_BASE + "/frequently-bought-together/discount.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: params.toString(),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Discount could not be created");
        return response.json();
      })
      .then(function (data) {
        if (!data || !data.discountCode) throw new Error("No discount code");
        return data.discountCode;
      });
  }

  /* Visiting /discount/<code> is how Shopify attaches a code to the cart;
     redirecting to cart.js keeps the response small instead of the home page */
  function fbtApplyDiscountCode(code) {
    return fetch(
      "/discount/" + encodeURIComponent(code) + "?redirect=%2Fcart.js",
    ).then(function (response) {
      if (!response.ok) throw new Error("Discount could not be applied");
    });
  }

  function initFbt(sectionEl) {
    var fbt = sectionEl.querySelector("[data-cwc-fbt]");
    if (!fbt) return;

    var totalEl = fbt.querySelector("[data-cwc-fbt-total]");
    var addButton = fbt.querySelector("[data-cwc-fbt-add]");
    var labelEl = fbt.querySelector("[data-cwc-fbt-label]");
    var listEl = fbt.querySelector("[data-cwc-fbt-list]");
    var template = fbt.querySelector("[data-cwc-fbt-template]");
    var totalWasEl = fbt.querySelector("[data-cwc-fbt-total-was]");
    /* One or both placements, depending on the block's Offer Placement */
    var offerEls = fbt.querySelectorAll("[data-cwc-fbt-offer]");
    var saveEl = fbt.querySelector("[data-cwc-fbt-save]");
    if (!totalEl || !addButton) return;

    /* Display only. The reduction itself comes from the automatic discount in
       Shopify and lands in the cart; these settings just let the widget show
       the same figure instead of quoting a total the customer never pays. */
    var discountPercent = parseFloat(fbt.dataset.discountPercent) || 0;
    var discountThreshold = parseInt(fbt.dataset.discountThreshold, 10) || 0;
    var showItemDiscounts = fbt.hasAttribute("data-cwc-fbt-item-discounts");
    var showMeta = !fbt.hasAttribute("data-cwc-fbt-no-meta");

    /* One request per page view, shared by the reveal and the click */
    var discountPrefsPromise = null;
    function discountPrefs() {
      if (discountPrefsPromise) return discountPrefsPromise;
      var productId = fbt.dataset.productId;
      var shop = fbt.dataset.shop;
      discountPrefsPromise = !productId || !shop
        ? Promise.resolve(null)
        : fbtLoadDiscountPrefs(productId, shop).catch(function (error) {
            console.warn("[cwc] bundle discount unavailable:", error);
            return null;
          });
      discountPrefsPromise.then(function (prefs) {
        /* The app is not offering a discount, so neither should this widget */
        if (prefs || discountPercent <= 0) return;
        discountPercent = 0;
        syncTotal();
      });
      return discountPrefsPromise;
    }

    /* Mints and applies the app's code for exactly these items. Resolves
       either way — a missing discount must never block the add itself. */
    function applyBundleDiscount(items, sum) {
      if (!discountFor(sum)) return Promise.resolve();

      return discountPrefs()
        .then(function (prefs) {
          if (!prefs || sum < prefs.minimum) return null;

          var productIds = [];
          checkboxes().forEach(function (check) {
            if (check.dataset.productId) productIds.push(check.dataset.productId);
          });

          return fbtCreateDiscountCode(prefs, fbt.dataset.shop, {
            currentProductId: fbt.dataset.productId,
            productIds: productIds,
            selectedProductIds: items.map(function (item) {
              return item.productId;
            }),
            selectedVariantIds: items.map(function (item) {
              return item.id;
            }),
          }).then(fbtApplyDiscountCode);
        })
        .catch(function (error) {
          console.warn("[cwc] bundle discount not applied:", error);
        });
    }

    /* Re-queried rather than captured: live recommendations replace these rows */
    function checkboxes() {
      return fbt.querySelectorAll("[data-cwc-fbt-check]");
    }

    function selected() {
      var items = [];
      checkboxes().forEach(function (check) {
        if (!check.checked || check.disabled || !check.dataset.variantId)
          return;
        items.push({
          id: check.dataset.variantId,
          productId: check.dataset.productId,
          price: parseInt(check.dataset.price, 10) || 0,
        });
      });
      return items;
    }

    function totalLabel(count) {
      var pattern = fbt.dataset.totalLabel || "Total for {count} items";
      var text = pattern.replace("{count}", count);
      /* naive, and English-only like the rest of this section's copy */
      return count === 1 ? text.replace(/\bitems\b/, "item") : text;
    }

    /* Rounded off the bundle total rather than per line, which is how the
       discount lands on the cart — summing rounded lines drifts a cent. */
    function discountFor(sum) {
      if (discountPercent <= 0 || sum < discountThreshold) return 0;
      return Math.round((sum * discountPercent) / 100);
    }

    /* Splits that one rounded figure back across the rows so the struck prices
       always add up to the total under them. Shopify's own per-line allocation
       can differ by a cent; the total is the number that has to match. */
    function allocate(prices, discount) {
      var parts = prices.map(function (price) {
        return Math.floor((price * discountPercent) / 100);
      });
      var spare = parts.reduce(function (acc, part) {
        return acc - part;
      }, discount);
      for (var i = 0; i < parts.length && spare > 0; i++) {
        parts[i] += 1;
        spare -= 1;
      }
      return parts;
    }

    function renderItemPrice(priceEl, was, now) {
      priceEl.textContent = "";
      if (was === now) {
        priceEl.textContent = moneyFormat(now);
        return;
      }
      var struck = document.createElement("s");
      struck.className = "cwc_product-buy-box__fbt-price-was";
      struck.textContent = moneyFormat(was);
      var current = document.createElement("span");
      current.className = "cwc_product-buy-box__fbt-price-now";
      current.textContent = moneyFormat(now);
      priceEl.appendChild(struck);
      priceEl.appendChild(current);
    }

    /* Opt-in: on a column this narrow three struck prices crowd the rows. */
    function syncItemPrices(discount) {
      if (!showItemDiscounts) return;

      var live = [];
      checkboxes().forEach(function (check) {
        var row = check.closest(".cwc_product-buy-box__fbt-item");
        var priceEl =
          row && row.querySelector(".cwc_product-buy-box__fbt-price");
        if (!priceEl) return;
        var price = parseInt(check.dataset.price, 10) || 0;
        /* An unticked row is not in the bundle, so it keeps its full price */
        if (!discount || !check.checked || check.disabled) {
          renderItemPrice(priceEl, price, price);
          return;
        }
        live.push({ priceEl: priceEl, price: price });
      });

      var parts = allocate(
        live.map(function (row) {
          return row.price;
        }),
        discount
      );
      live.forEach(function (row, i) {
        renderItemPrice(row.priceEl, row.price, row.price - parts[i]);
      });
    }

    /* Two states: the saving once the bundle qualifies, and the gap left to
       close before it does — the second is what makes the bar worth putting
       above the products rather than under them. */
    function syncOffer(sum, discount) {
      if (!offerEls.length) return;

      var pending = !discount && discountPercent > 0 && sum > 0;
      var copy = pending
        ? fbt.dataset.discountNotePending || ""
        : fbt.dataset.discountNote || "";
      var text = copy
        .replace("{percent}", discountPercent)
        .replace("{amount}", moneyFormat(discount))
        .replace("{threshold}", moneyFormat(discountThreshold))
        .replace("{remaining}", moneyFormat(Math.max(discountThreshold - sum, 0)));

      offerEls.forEach(function (el) {
        el.textContent = text;
        el.classList.toggle("cwc_product-buy-box__fbt-offer--pending", pending);
        el.hidden = !text || (!discount && !pending);
      });
    }

    /* The label already toggles the input; this only mirrors that onto the row
       so the card itself can read as selected. */
    function syncRows() {
      checkboxes().forEach(function (check) {
        var row = check.closest(".cwc_product-buy-box__fbt-item");
        if (!row) return;
        row.classList.toggle(
          "cwc_product-buy-box__fbt-item--selected",
          check.checked && !check.disabled
        );
      });
    }

    function syncSave(discount) {
      if (!saveEl) return;
      var copy = fbt.dataset.saveLabel || "";
      saveEl.textContent = copy
        .replace("{amount}", moneyFormat(discount))
        .replace("{percent}", discountPercent);
      saveEl.hidden = !discount || !copy;
    }

    function syncTotal() {
      var items = selected();
      var sum = items.reduce(function (acc, item) {
        return acc + item.price;
      }, 0);
      var discount = discountFor(sum);

      totalEl.textContent = moneyFormat(sum - discount);
      if (totalWasEl) {
        totalWasEl.textContent = discount ? moneyFormat(sum) : "";
        totalWasEl.hidden = !discount;
      }
      syncOffer(sum, discount);
      syncSave(discount);
      syncRows();
      syncItemPrices(discount);
      if (labelEl) labelEl.textContent = totalLabel(items.length);
      addButton.disabled = items.length === 0;
    }

    function bindChecks() {
      checkboxes().forEach(function (check) {
        if (check.dataset.cwcBound === "true") return;
        check.dataset.cwcBound = "true";
        check.addEventListener("change", syncTotal);
      });
    }

    function renderRecommendations(products) {
      if (!template || !listEl) return;
      var rows = products.map(function (product) {
        var variant =
          product.variants.filter(function (candidate) {
            return candidate.available;
          })[0] || product.variants[0];
        if (!variant) return null;

        var row = template.content.firstElementChild.cloneNode(true);
        var check = row.querySelector("[data-cwc-fbt-check]");
        var image = row.querySelector("img");
        var name = row.querySelector(".cwc_product-buy-box__fbt-name");
        var meta = row.querySelector(".cwc_product-buy-box__fbt-meta");
        var price = row.querySelector(".cwc_product-buy-box__fbt-price");

        check.dataset.variantId = variant.id;
        check.dataset.productId = product.id;
        check.dataset.price = variant.price;
        check.setAttribute(
          "aria-label",
          "Add " + product.title + " to this bundle",
        );
        name.textContent = product.title;
        price.textContent = moneyFormat(variant.price);

        if (product.featured_image) {
          image.src = fbtThumbUrl(product.featured_image);
          image.hidden = false;
        }

        if (product.type && showMeta) {
          meta.textContent = product.type;
          meta.hidden = false;
        }

        return row;
      });

      rows = rows.filter(Boolean);
      if (!rows.length) return;

      /* Swap in one go, only now that every row is ready — a half-built list is
         worse than the fallback it replaces */
      listEl
        .querySelectorAll("[data-cwc-fbt-fallback]")
        .forEach(function (row) {
          row.remove();
        });
      rows.forEach(function (row) {
        listEl.appendChild(row);
      });

      fbt.removeAttribute("hidden");
      bindChecks();
      syncTotal();
    }

    function loadRecommendations() {
      if (fbt.dataset.cwcFbtLoaded === "true") return;
      fbt.dataset.cwcFbtLoaded = "true";

      var productId = fbt.dataset.productId;
      var shop = fbt.dataset.shop;
      if (!productId || !shop) return;

      discountPrefs();

      var max = parseInt(fbt.dataset.max, 10) || 3;

      fbtFetchHandles(productId, shop)
        .then(function (handles) {
          if (!handles.length) return null;
          /* a couple spare, so sold-out companions don't shrink the row */
          return fbtHydrate(handles.slice(0, max + 2));
        })
        .then(function (products) {
          if (!products) return;

          var usable = products
            .filter(Boolean)
            .filter(function (product) {
              return (
                product.available && String(product.id) !== String(productId)
              );
            })
            .slice(0, max);

          if (usable.length) renderRecommendations(usable);
        })
        .catch(function (error) {
          /* leave the picked fallback standing, or stay hidden if there is none —
             but say so, since a silently empty block is hard to tell from a bug */
          console.warn(
            "[cwc] bought-together recommendations unavailable:",
            error,
          );
        });
    }

    bindChecks();

    addButton.addEventListener("click", function () {
      var picked = selected();
      if (!picked.length) return;

      var sum = picked.reduce(function (acc, item) {
        return acc + item.price;
      }, 0);
      var items = picked.map(function (item) {
        return { id: item.id, quantity: 1 };
      });

      var original = addButton.textContent;
      addButton.disabled = true;

      applyBundleDiscount(picked, sum)
        .then(function () {
          return addItems(items);
        })
        .then(function () {
          addButton.disabled = false;
          afterAdd(addButton, original);
        })
        .catch(function () {
          addButton.disabled = false;
          addButton.textContent = "Try Again";
          window.setTimeout(function () {
            addButton.textContent = original;
          }, 2000);
        });
    });

    syncTotal();

    /* Fetch only when the block is about to be seen, so recommendations never
       compete with the page's own images for bandwidth.

       With no fallback rendered the block starts hidden, and a display:none
       element never intersects anything — so watch its container instead. */
    if (fbt.hasAttribute("data-cwc-fbt-fetch")) {
      var watched = fbt.hasAttribute("hidden") ? fbt.parentElement : fbt;

      if ("IntersectionObserver" in window && watched) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              observer.disconnect();
              loadRecommendations();
            });
          },
          { rootMargin: "400px" },
        );
        observer.observe(watched);
      } else {
        loadRecommendations();
      }
    }
  }

  /* ---------- Delivery Estimate ----------
     Dates are plain calendar days in store (Pacific) time, held as UTC
     midnights so the math never shifts with the shopper's own time zone. */
  var STORE_TIME_ZONE = "America/Los_Angeles";

  function initDeliveryEstimate(sectionEl) {
    var estimate = sectionEl.querySelector("[data-delivery-estimate]");
    if (!estimate) return;
    var dateEl = estimate.querySelector("[data-estimate-date]");
    if (!dateEl) return;

    var data = estimate.dataset;
    var closed = (data.closedDates || "").split(",").filter(function (date) {
      return /^\d{4}-\d{2}-\d{2}$/.test(date);
    });
    var isBusinessDay = function (date) {
      var day = date.getUTCDay();
      return day !== 0 && day !== 6 && closed.indexOf(date.toISOString().slice(0, 10)) === -1;
    };

    // Ordered on a business day before the cutoff: processing counts from
    // today, otherwise from the next business day
    var now = storeNow();
    var start = now.date;
    if (!isBusinessDay(start) || now.hour >= (parseInt(data.cutoffHour, 10) || 0)) {
      start = addBusinessDays(start, 1, isBusinessDay);
    }

    var processingMin = parseInt(data.processingMin, 10) || 0;
    var processingMax = Math.max(parseInt(data.processingMax, 10) || 0, processingMin);
    var transitMin = parseInt(data.transitMin, 10) || 0;
    var transitMax = Math.max(parseInt(data.transitMax, 10) || 0, transitMin);

    var earliest = addBusinessDays(addBusinessDays(start, processingMin, isBusinessDay), transitMin, isBusinessDay);
    var latest = addBusinessDays(addBusinessDays(start, processingMax, isBusinessDay), transitMax, isBusinessDay);

    var format = function (date) {
      return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
    };
    dateEl.textContent =
      earliest.getTime() === latest.getTime() ? format(latest) : format(earliest) + " \u2013 " + format(latest);
    estimate.hidden = false;
  }

  function storeNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: STORE_TIME_ZONE,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .forEach(function (part) {
        parts[part.type] = parseInt(part.value, 10);
      });
    return {
      date: new Date(Date.UTC(parts.year, parts.month - 1, parts.day)),
      hour: parts.hour,
    };
  }

  // Counts forward over business days only; the start day itself never counts
  function addBusinessDays(date, days, isBusinessDay) {
    var result = new Date(date);
    var added = 0;
    while (added < days) {
      result.setUTCDate(result.getUTCDate() + 1);
      if (isBusinessDay(result)) added += 1;
    }
    return result;
  }

  /* ---------- Gallery Testimonial ---------- */

  // Judge.me's public review feed (the same one CWC Product Reviews reads); no API key
  var REVIEW_FEED_URL = "https://cdn.judge.me/reviews/reviews_for_widget";
  // The testimonial only shows on desktop; matches the CSS breakpoint
  var TESTIMONIAL_QUERY = "(min-width: 1025px)";

  function initTestimonial(sectionEl) {
    var card = sectionEl.querySelector(".cwc_product-buy-box__testimonial[data-product-review]");
    if (!card || !window.fetch) return;

    // Hidden below desktop, so only fetch once the screen is wide enough
    var query = window.matchMedia(TESTIMONIAL_QUERY);
    if (query.matches) {
      loadProductReview(card);
      return;
    }
    var onChange = function (event) {
      if (!event.matches) return;
      query.removeEventListener("change", onChange);
      loadProductReview(card);
    };
    query.addEventListener("change", onChange);
  }

  function loadProductReview(card) {
    var domain = card.dataset.shopDomain;
    var minRating = parseFloat(card.dataset.minRating) || 4;
    var params = new URLSearchParams({
      url: domain,
      shop_domain: domain,
      platform: "shopify",
      product_id: card.dataset.productId,
      page: "1",
      per_page: "20",
    });

    fetch(REVIEW_FEED_URL + "?" + params.toString())
      .then(function (response) {
        if (!response.ok) throw new Error("Judge.me feed " + response.status);
        return response.json();
      })
      .then(function (data) {
        var match = (data.reviews || []).map(normalizeReview).find(function (review) {
          return review.rating >= minRating && review.body && review.author;
        });
        if (match) applyReview(card, match);
      })
      .catch(function () {
        // Feed unreachable: keep the default review
      });
  }

  // Judge.me sends names HTML-escaped and bodies as HTML; reduce both to plain text
  function normalizeReview(review) {
    var decode = function (html) {
      return new DOMParser()
        .parseFromString(html || "", "text/html")
        .body.textContent.replace(/\s+/g, " ")
        .trim();
    };
    return {
      rating: parseFloat(review.rating) || 0,
      author: review.is_anonymous_reviewer ? "" : decode(review.reviewer_name),
      verified: review.verified_buyer === true,
      body: decode(review.body_html),
    };
  }

  function applyReview(card, review) {
    var stars = card.querySelector("[data-testimonial-stars]");
    var quote = card.querySelector("[data-testimonial-quote]");
    var name = card.querySelector("[data-testimonial-name]");
    var photo = card.querySelector("[data-testimonial-photo]");
    var verified = card.querySelector("[data-testimonial-verified]");

    if (stars) {
      stars.style.setProperty("--rating", Math.min(review.rating * 20, 100) + "%");
      stars.setAttribute("aria-label", review.rating + " out of 5 stars");
    }
    if (quote) quote.textContent = "\u201C" + review.body + "\u201D";
    if (name) name.textContent = review.author;
    // The default photo belongs to the default reviewer
    if (photo) photo.remove();
    if (verified) verified.hidden = !review.verified;
    card.hidden = false;
  }

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcBuyBoxInit === "true") return;
    sectionEl.dataset.cwcBuyBoxInit = "true";

    initGallery(sectionEl);
    initQuantity(sectionEl);
    initVariantSelect(sectionEl);
    initAddToCart(sectionEl);
    initFbt(sectionEl);
    initDeliveryEstimate(sectionEl);
    initTestimonial(sectionEl);
  }

  function initAllSections() {
    document.querySelectorAll(".cwc_product-buy-box").forEach(initSection);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor: Re-initialize when section is loaded/reloaded
  document.addEventListener("shopify:section:load", function (event) {
    var section = event.target.querySelector(".cwc_product-buy-box");
    if (section) initSection(section);
  });
})();
