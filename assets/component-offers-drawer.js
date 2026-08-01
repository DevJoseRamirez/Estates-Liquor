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


class OffersDrawer extends _global_drawer__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .A {
  constructor() {
    super();
    this.sectionId = this.getAttribute('data-section-id');
    this.heading = this.querySelector('[data-offers-drawer-heading]');
    this.TOOLTIP_COOKIE_NAME = 'offers-drawer-tooltip';
    this.showIcon = this.getAttribute('data-show-icon') === 'true';
    this.init = this.init.bind(this);
    this.injectIconInHeading = this.injectIconInHeading.bind(this);
    this.initTooltip = this.initTooltip.bind(this);
    this.showDailyTooltip = this.showDailyTooltip.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.handleSectionSelect = this.handleSectionSelect.bind(this);
    this.handleSectionDeselect = this.handleSectionDeselect.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.wetheme.webcomponentRegistry.register({key: 'component-offers-drawer'});

    window.eventBus.on('open:offers:drawer', this.init);
    window.eventBus.on('close:offers:drawer', this.closeDrawer);

    if (this.showIcon) {
      this.injectIconInHeading();
      window.eventBus.on('injectIcon:offers:drawer', this.injectIconInHeading);
    }

    this.initTooltip();

    // Editor events
    if (window.Shopify.designMode) {
      document.addEventListener('shopify:section:select', this.handleSectionSelect);
      document.addEventListener('shopify:section:deselect', this.handleSectionDeselect);
    }
  }

  init() {
    this.classList.remove('shown-on-scroll');
    this.openDrawer();

    // Show animations
    this.offsetHeight; // force a reflow
    this.classList.add('shown-on-scroll');
  }

  injectIconInHeading() {
    if (!this.heading) return;

    const icon = document.querySelector('[data-offers-drawer-icon]');
    if (!icon) return;

    const existingIconClone = this.heading.querySelector('[data-offers-drawer-icon-clone]');
    if (existingIconClone) {
      existingIconClone.remove();
    }

    const iconClone = icon.cloneNode(true);
    iconClone.removeAttribute('data-offers-drawer-icon');
    iconClone.setAttribute('data-offers-drawer-icon-clone', true);
    this.heading.prepend(iconClone);
  }

  initTooltip() {
    const tooltip = document.querySelector('[data-offers-drawer-tooltip]');
    if (!tooltip) return;

    this.showDailyTooltip();
  }

  showTooltip() {
    const tooltips = document.querySelectorAll('[data-offers-drawer-tooltip]');
    if (tooltips.length === 0) return;

    setTimeout(() => {
      tooltips.forEach(tooltip => {
        tooltip.classList.remove('hide');
      });
    }, 1000);

    setTimeout(() => {
      tooltips.forEach(tooltip => {
        tooltip.classList.add('fade-out-tooltip');
      });
    }, 7000);

    setTimeout(() => {
      tooltips.forEach(tooltip => {
        tooltip.classList.add('hide');
      });
    }, 7500);
  }

  showDailyTooltip() {
    if (!this.isLocalStorageSupported()) return;

    const lastShownDate = localStorage.getItem("tooltipDate");
    const today = new Date().toISOString().slice(0, 10);
    if (lastShownDate !== today) {
      this.showTooltip();
      localStorage.setItem("tooltipDate", today);
    }
  }

  isLocalStorageSupported() {
    try {
      return typeof Storage !== 'undefined' && window.localStorage;
    } catch (e) {
      return false;
    }
  }

  handleSectionSelect(e) {
    const sectionId = e.detail.sectionId;
    if (this.sectionId != sectionId) return;

    // Disable transitions when section reloads
    if (e.detail.load) {
      this.classList.add('disable-transitions');
      setTimeout(() => {
        this.classList.remove('disable-transitions');
      }, 500);
    }

    this.init();
  }

  handleSectionDeselect(e) {
    const sectionId = e.detail.sectionId;
    if (this.sectionId != sectionId) return;

    this.closeDrawer();
  }

  disconnectedCallback() {
    window.eventBus.off('open:offers:drawer', this.init);

    if (window.Shopify.designMode) {
      document.removeEventListener('shopify:section:select', this.handleSectionSelect);
      document.removeEventListener('shopify:section:deselect', this.handleSectionDeselect);
    }
  }
}

customElements.define('offers-drawer', OffersDrawer);

/******/ })()
;