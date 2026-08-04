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

  function initGallery(sectionEl) {
    var main = sectionEl.querySelector("[data-cwc-media-image]");
    var thumbs = sectionEl.querySelectorAll("[data-cwc-thumb]");
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var full = thumb.dataset.full;
        if (full) main.src = full;
        thumbs.forEach(function (t) {
          t.classList.remove("cwc_product-buy-box__thumb--active");
        });
        thumb.classList.add("cwc_product-buy-box__thumb--active");
      });
    });
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

  function initFbt(sectionEl) {
    var fbt = sectionEl.querySelector("[data-cwc-fbt]");
    if (!fbt) return;

    var totalEl = fbt.querySelector("[data-cwc-fbt-total]");
    var addButton = fbt.querySelector("[data-cwc-fbt-add]");
    var labelEl = fbt.querySelector("[data-cwc-fbt-label]");
    var listEl = fbt.querySelector("[data-cwc-fbt-list]");
    var template = fbt.querySelector("[data-cwc-fbt-template]");
    if (!totalEl || !addButton) return;

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

    function syncTotal() {
      var items = selected();
      var sum = items.reduce(function (acc, item) {
        return acc + item.price;
      }, 0);

      totalEl.textContent = moneyFormat(sum);
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
      console.log(rows);
      console.log("rows");
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

        if (product.type) {
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
      var items = selected().map(function (item) {
        return { id: item.id, quantity: 1 };
      });
      if (!items.length) return;

      var original = addButton.textContent;
      addButton.disabled = true;

      addItems(items)
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

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcBuyBoxInit === "true") return;
    sectionEl.dataset.cwcBuyBoxInit = "true";

    initGallery(sectionEl);
    initQuantity(sectionEl);
    initVariantSelect(sectionEl);
    initAddToCart(sectionEl);
    initFbt(sectionEl);
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
