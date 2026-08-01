/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 5669:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ GlobalDrawer)
/* harmony export */ });
class GlobalDrawer extends HTMLElement {
  constructor() {
    super();
    this.closeElements = this.querySelectorAll('[data-drawer-close]');
    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.closeAllDrawers = this.closeAllDrawers.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-drawer'});
    window.eventBus.on('close:all:drawers', this.closeAllDrawers);
    this.closeElements.forEach((element) => {
      element.addEventListener('click', this.closeDrawer);
    });

    if (window.Shopify.designMode) {
      window.addEventListener('resize', this.handleResize);
    }
  }

  openDrawer() {
    window.eventBus.emit('close:all:drawers', this); // Close all other global drawers before opening this one
    this.setAttribute('aria-hidden', 'false');
    document.body.classList.add('js-drawer-open'); // Lock scroll
    this.addEventListener('transitionend', this.handleTransitionEnd);
    // Emit event when drawer opens
    window.eventBus.emit('drawer:opened', this);
  }

  closeDrawer() {
    this.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('js-drawer-open'); // Unlock scroll
    this.removeEventListener('transitionend', this.handleTransitionEnd);
    // Emit event when drawer closes
    window.eventBus.emit('drawer:closed', this);
  }

  closeAllDrawers(e) {
    if (e === this) return; // Only close other drawers not this one
    this.closeDrawer();
  }

  handleTransitionEnd(e) {
    // Trap focus once drawer is fully open
    if (e.target === this) {
      this.trapFocus();
    }
  }

  trapFocus() {
    const focusableElements = this.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    firstFocusableElement.focus();
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  handleResize() {
    this.classList.add('disable-transitions');
    setTimeout(() => {
      this.classList.remove('disable-transitions');
    }, 500);
  }

  disconnectedCallback() {
    if (window.Shopify.designMode) {
      window.removeEventListener('resize', this.handleResize);
    }
  }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/* harmony import */ var _global_drawer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5669);


class CartDrawer extends _global_drawer__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .A {
  constructor() {
    super();
    this.dynamicContentIds = [
      'cart-header',
      'cart-body',
      'cart-footer'
    ];
    this.scrollElement = this.querySelector('[data-cart-scroll-element]');
    this.handleCartOpen = this.handleCartOpen.bind(this);
    this.handleCartUpdate = this.handleCartUpdate.bind(this);
    this.handleCartRender = this.handleCartRender.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.wetheme.webcomponentRegistry.register({key: 'component-cart-drawer'});
    window.eventBus.on('open:cart:drawer', this.handleCartOpen);
    window.eventBus.on('update:cart:drawer', this.handleCartUpdate);
    window.eventBus.on('render:cart:drawer', this.handleCartRender);
  }

  handleCartOpen(e) {
    /* ===== Scroll to top of the cart if necessary ===== */
    if (e?.scrollToTop && this.scrollElement) {
      this.scrollElement.scrollTo(0, 0);
    }

    /* ===== Open the drawer ===== */
    this.openDrawer();
  }

  handleCartUpdate(e) {
    if (!e) return;
    if (e.sections?.['cart-drawer']) {
      this.renderCartDrawer(e.sections['cart-drawer']);
    }
  }

  renderCartDrawer(html) {
    /* ===== Re-render cart drawer with updated content ===== */
    this.dynamicContentIds.forEach((id) => {
      const selector = `[data-cart-dynamic-content="${id}"]`;
      const updatedContent = this.getContent(html, selector);
      const targetElement = this.querySelector(selector);
      if (targetElement) {
        targetElement.innerHTML = updatedContent;
      }
    });
    this.trapFocus();
  }

  async handleCartRender() {
    /* ===== Fetch cart drawer using section rendering API (rather than bundled section rendering) - needed when adding more products to the cart than are in stock ===== */
    try {
      const response = await fetch(window.Shopify.routes.root + "?sections=cart-drawer");
      const responseJson = await response.json();
      if (responseJson?.['cart-drawer']) {
        this.renderCartDrawer(responseJson['cart-drawer']);
      }
    } catch (error) {
      console.error(`Failed to fetch cart drawer:`, error);
    }
  }

  getContent(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector)?.innerHTML;
  }
}

customElements.define('cart-drawer', CartDrawer);
/******/ })()
;