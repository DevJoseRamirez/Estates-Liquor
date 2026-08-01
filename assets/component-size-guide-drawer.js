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


class SizeGuideDrawer extends _global_drawer__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .A {
  constructor() {
    super();
    this.pageTitleContainer = this.querySelector('[data-size-guide-dynamic-content="size-guide-header"] h3');
    this.pageContentContainer = this.querySelector('[data-size-guide-content]');
    this.loadPageContent = this.loadPageContent.bind(this);
    this.init = this.init.bind(this);
    this.sectionId = this.getAttribute('data-section-id');
  }

  connectedCallback() {
    super.connectedCallback();
    window.wetheme.webcomponentRegistry.register({key: 'component-size-guide-drawer'});
    
    window.eventBus.on('open:size:guide', this.init);
    window.eventBus.on('close:size:guide', this.closeDrawer);
  }

  init(event) {
    if (event && event.url) {
      this.loadPageContent(event.url);
    }
    this.openDrawer();
    this.handleEditorEvents();
  }

  // Fetch and load page content from the given URL
  async loadPageContent(url) {
    try {
      // Clear existing content
      if (this.pageContentContainer) {
        this.pageContentContainer.innerHTML = '';
      }
      
      if (this.pageTitleContainer) {
        this.pageTitleContainer.innerHTML = '';
      }
      
      // Fetch the page content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`);
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const pageTitle = doc.querySelector('.main-page-content [data-page-title]');
      
      if (pageTitle && this.pageTitleContainer) {
        this.pageTitleContainer.textContent = pageTitle.textContent;
      } else {
        console.error('Could not find page title or container');
      }
      
      // Extract the main content from the page
      const pageContent = doc.querySelector('.main-page-content');
      
      if (pageContent && this.pageContentContainer) {
        this.pageContentContainer.appendChild(pageContent);
      } else {
        console.error('Could not find page content or container');
      }
    } catch (error) {
      console.error('Error loading size guide content:', error);
    }
  }

  handleEditorEvents() {
    if (window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', () => {
        const sizeGuideLink = document.querySelector('product-information a[data-size-guide-link]');
        if (sizeGuideLink) {
          const href = sizeGuideLink.href;
          if (href) {
            this.loadPageContent(href);
          }
        }
      });
    }
  }

  disconnectedCallback() {
    window.eventBus.off('open:size:guide', this.init);
    window.eventBus.off('close:size:guide', this.closeDrawer);
    super.disconnectedCallback();
  }
}

customElements.define('size-guide-drawer', SizeGuideDrawer);
/******/ })()
;