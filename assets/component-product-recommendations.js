/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/javascripts/Component.js


class Component {
  /**
   * Generic component, inherited class will be called to receive things like resize events.
   *
   * @param {import('./ThemeBase').default} theme
   * @param {HTMLElement} element
   */
  constructor(theme, element) {
    this.theme = theme;
    this.element = element;
    theme.registerComponent(this);
  }

    /**
     * This will be called immediatelly when window resizes.
     *
     * NOTE: prefer using onWindowResize as it's already debounced.
     *
     * @param {Object} params
     * @param {number} params.width Width of the window
     */
    onWindowResizeRaw = ({ width }) => {}

    /**
     * This will be called regularly (throttled) when window is being resized.
     *
     * @param {Object} params
     * @param {number} params.width New width of the window
     * @param {number} params.oldWidth Width of the window last time this was called
     * @param {import("./constants").Breakpoint} params.breakpoint Current width breakpoint
     */
    onWindowResize = ({ width, oldWidth, breakpoint }) => {}

    /**
     * This will be called when window is being resized and it changes current breakpoint.
     *
     * @param {Object} params
     * @param {number} params.width New width of the window
     * @param {import("./constants").Breakpoint} params.breakpoint Current width breakpoint
     * @param {import("./constants").Breakpoint} params.oldBreakpoint Breakpoint last time this was called
     */
    onWindowResizeBreakpoint = ({ width, breakpoint, oldBreakpoint }) => {}

    /**
     * This will be called regularly (throttled) when window is scrolled
     */
    onWindowScroll = () => {}
}

;// ./src/javascripts/global/QuickAdd.js


class QuickAdd extends Component {
  constructor(theme, element) {
    super(theme, element);

    this.theme = theme;
    this.element = element;
    this.onSubmit = this.onSubmit.bind(this);
    this.isProcessing = false;
    this.cartAction = document.getElementById('PageContainer').dataset.cartAction;
    this.cartType = document.getElementById('PageContainer').dataset.cartType;
    this.languageUrl = document.getElementById('PageContainer').dataset.languageUrl;
    this.formWrappers = /** @type {NodeListOf<HTMLElement>} */ (this.element.querySelectorAll('.quick-add-wrapper.is-singular'));
    this.wethemeGlobal = document.querySelector('script#wetheme-global');
    this.translationsObject = JSON.parse(this.wethemeGlobal.textContent);

    if (!this.formWrappers.length) {
      return;
    }

    this.formWrappers.forEach((wrapper) => {
      const form = wrapper.querySelector('.shopify-product-form');
      if (form && !form.hasAttribute('data-quick-add-initialized')) {
        form.addEventListener('submit', this.onSubmit);
        form.setAttribute('data-quick-add-initialized', 'true');
      }
    });
  }

  async onSubmit(e) {
    // Prevent duplicate submissions
    if (this.isProcessing) {
      e.preventDefault();
      return;
    }

    // Go straight to cart page, use html form submit event.
    if(this.cartType == 'page' && this.cartAction != 'show_added_message') {
      return;
    }

    e.preventDefault();
    this.isProcessing = true;

    const currentForm = e.currentTarget;
    const currentButton = currentForm.querySelector('[data-quick-add-button]');
    const productWrapper = currentForm.closest('.quick-add-wrapper.is-singular');

    // Store original button state for cleanup
    let previousInnerHTML = null;
    let isDesktopQuickAdd = false;

    try {
      if (!productWrapper) {
        console.error('Product wrapper not found.');
        return false;
      }

      // Retrieve liveRegion
      const liveRegion = currentForm.querySelector('.sr-only[aria-live="polite"]');
      
      isDesktopQuickAdd = currentButton.classList.contains('quick-add-button-desktop');

      // Loading spinner.
      if (isDesktopQuickAdd) {
        previousInnerHTML = currentButton.innerHTML;
        currentButton.classList.add('is-loading');
        currentButton.innerHTML = `<svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" class="spin flex-full"><g clip-path="url(#clip0_3605_47041)"><path d="M12.5 23C6.42487 23 1.5 18.0751 1.5 12C1.5 5.92487 6.42487 1 12.5 1C18.5751 1 23.5 5.92487 23.5 12C23.5 15.1767 22.1534 18.0388 20 20.0468" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></g><defs><clipPath id="clip0_3605_47041"><rect width="24" height="24" fill="none" transform="translate(0.5)"/></clipPath></defs>${ this.translationsObject.translations.loading }</svg>`;
      }

      const formData = new FormData(currentForm);
      const data = new URLSearchParams(formData).toString();
      const response = await window.fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });
      if (!response.ok) {
        // FIXME: error handling
        return false;
      }

      // Update cart drawer
      if(this.cartType == 'drawer') {
        const responseJson = await response.json();
        window.eventBus.emit('update:cart:drawer', responseJson);
      }

      const languageParam = !this.languageUrl || this.languageUrl == '/' ? '' : this.languageUrl;
      const response2 = await window.fetch(`${languageParam}/cart?view=compare`);
      if (!response2.ok) {
        // FIXME: error handling
        return false;
      }
      const cart = await response2.json();

      if(this.cartType == 'drawer' && this.cartAction == 'go_to_or_open_cart') {
        window.eventBus.emit('open:cart:drawer', { scrollToTop: true });
      }
      else {
        if (isDesktopQuickAdd) {
          currentButton.classList.remove('is-loading');
          currentButton.innerHTML = this.translationsObject.translations.productAdded;
        }
      }

      if (this.cartType == 'drawer') {
        const successMessage = productWrapper.getAttribute('data-product-added');
        if (liveRegion && successMessage) {
          liveRegion.textContent = successMessage;
        }
      }
      
      this.theme.updateCartCount(cart);

      if (isDesktopQuickAdd) {
        setTimeout(() => {
          const translationKey = currentButton.dataset.addToCartTranslationKey || 'addToCart';
          currentButton.classList.remove('is-loading');
          currentButton.innerHTML = this.translationsObject.translations[translationKey];
        }, 2000);
      }

    } catch (e) {
      console.error('Unable to add to cart: ', e);
      // FIXME error handling
    } finally {
      // Ensure button is always restored to a usable state on error
      if (currentButton && isDesktopQuickAdd && previousInnerHTML) {
        // Only restore if button still has the loading class (error path)
        if (currentButton.classList.contains('is-loading')) {
          currentButton.classList.remove('is-loading');
          currentButton.innerHTML = previousInnerHTML;
        }
      }
      this.isProcessing = false;
    }

    return false;
  }
}

;// ./src/javascripts/webcomponents/product-recommendations.js


class productRecommendations extends HTMLElement {
  constructor() {
    super();

    this.isAlreadyLoaded = this.querySelector('.product-page-related-products');
    this.abortController = null; // Abort controller for request cancellation
    this.bindEventHandlers();
  }

  connectedCallback() {
    this.addEventListeners();
    this.init();
  }

  bindEventHandlers() {
    this.debouncedRenderRecommendationsBound = this.debouncedRenderRecommendations.bind(this);
  }

  addEventListeners() {
    if (window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', this.debouncedRenderRecommendationsBound);
    }
  }

  debouncedRenderRecommendations() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }

    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort();
    }

    // Use longer delay in design mode to allow server to process setting changes
    const delay = window.Shopify.designMode ? 800 : 100;
    this.renderTimeout = setTimeout(() => this.renderRecommendations(), delay);
  }

  init() {
    // Remove existing products so the new ones can be loaded.
    if(this.isAlreadyLoaded) this.isAlreadyLoaded.remove();

    window.wetheme.webcomponentRegistry.register({key: 'product-recommendations'});

    // In design mode, render immediately instead of waiting for intersection
    if (window.Shopify.designMode) {
      this.renderRecommendations();
      return;
    }

    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      this.renderRecommendations();
    }

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: '0px 0px 0px 0px',
    }).observe(this);
  }

  renderRecommendations() {
    // Cancel any existing request
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller for this request
    this.abortController = new AbortController();

    // Add cache-busting parameter in design mode
    let url = this.dataset.recommendationsUrl;
    if (window.Shopify.designMode) {
      url += `&t=${Date.now()}`;
    }

    fetch(url, { signal: this.abortController.signal })
      .then((response) => response.text())
      .then((text) => {
        var container = document.createElement("div");
        container.innerHTML = text;
        const recommendations = container.querySelector('product-recommendations');

        if (recommendations && recommendations.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
          window.wetheme.addBadges(this, 1000);
          this.quickAddButtons = new QuickAdd(window.wetheme, this);

          const sectionLoadedEvent = new CustomEvent('theme:section:load', {
            detail: {
              sectionId: this.dataset.sectionId,
            },
          });

          document.dispatchEvent(sectionLoadedEvent);

          const recommendationsLoadedEvent = new CustomEvent('recommendations:loaded');
          document.dispatchEvent(recommendationsLoadedEvent);
        }
      })
      .catch((e) => {
        // Don't log errors for aborted requests
        if (e.name !== 'AbortError') {
          console.error(e);
        }
      });
  }

  disconnectedCallback() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }

    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort();
    }

    if (window.Shopify.designMode) {
      document.removeEventListener('shopify:section:load', this.debouncedRenderRecommendationsBound);
    }
  }

  // check if we're on mobile
  isMobile = () => {
    return window.matchMedia('(max-width: 1023px)').matches;
  }
}

customElements.define('product-recommendations', productRecommendations);

/******/ })()
;