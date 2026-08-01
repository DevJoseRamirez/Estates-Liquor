/******/ (() => { // webpackBootstrap
if (!customElements.get('recently-viewed-products')) {
  class RecentlyViewedProducts extends HTMLElement {
    constructor() {
      super();

      this.abortController = null; // Abort controller for request cancellation
      this.cacheDOMElements();
      this.bindEventHandlers();
    }

    connectedCallback() {
      this.addEventListeners();
      this.debouncedRenderRecentlyViewedProducts();
    }

    cacheDOMElements() {
      this.sectionId = this.getAttribute('data-wetheme-section-id');
      this.isPreviewMode = this.getAttribute('data-is-preview-mode') == 'true';
      this.wrapper = this.closest('data-recently-viewed-wrapper');
      if (!this.sectionId || !this.wrapper) return;
    }

    bindEventHandlers() {
      this.debouncedRenderRecentlyViewedProductsBound = this.debouncedRenderRecentlyViewedProducts.bind(this);
    }

    addEventListeners() {
      if (window.Shopify.designMode) {
        document.addEventListener('shopify:section:load', this.debouncedRenderRecentlyViewedProductsBound);
      }
    }

    debouncedRenderRecentlyViewedProducts() {
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout);
      }

      // Cancel any pending requests
      if (this.abortController) {
        this.abortController.abort();
      }

      // Use longer delay in design mode to allow server to process setting changes
      const delay = window.Shopify.designMode ? 800 : 100;
      this.renderTimeout = setTimeout(() => this.renderRecentlyViewedProducts(), delay);
    }

    async renderRecentlyViewedProducts() {
      try {
        // Cancel any existing request
        if (this.abortController) {
          this.abortController.abort();
        }

        // Create new abort controller for this request
        this.abortController = new AbortController();

        // Retrieve the list of recently viewed products from localStorage
        const recentlyViewedProducts = JSON.parse(localStorage.getItem('theme:recently-viewed-products') || '[]');

        if (!recentlyViewedProducts.length && !this.isPreviewMode) {
          this.wrapper.style.display = 'none';
          return;
        }

        // Convert the list into a Set
        const items = new Set(recentlyViewedProducts);

        // If the element has an 'exclude-id' attribute, remove that item from the Set
        if (this.hasAttribute('exclude-id')) {
          items.delete(parseInt(this.getAttribute('exclude-id')));
        }

        if (!items.size && !this.isPreviewMode) {
          this.wrapper.style.display = 'none';
          return;
        }

        // Create a search query string from the Set
        const queryString = Array.from(items.values(), (item) => `id:${item}`)
          .slice(0, parseInt(this.getAttribute('data-products-to-show')))
          .join(' OR ');

        // Construct the URL with cache-busting parameter in design mode
        let url = `${window.Shopify.routes.root}search?type=product&q=${queryString}&section_id=${this.sectionId}`;
        if (window.Shopify.designMode) {
          url += `&t=${Date.now()}`;
        }

        // Fetch the URL and get the results
        const response = await fetch(url, { signal: this.abortController.signal });
        const responseText = await response.text();

        // Parse the HTML response using a temporary div
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = responseText;

        // Select the recently-viewed-products element from the parsed HTML
        const recentlyViewedProductsElement = tempDiv.querySelector('recently-viewed-products');

        // Check if the element has child elements
        if (recentlyViewedProductsElement && recentlyViewedProductsElement.childElementCount > 0) {
          // Replace the children of this element with the imported nodes from the parsed HTML
          this.replaceChildren(...recentlyViewedProductsElement.childNodes);

          // Re-initialize quick add, quick view, etc
          window.eventBus.emit('recentlyViewed:updated');
        } else {
          // If no child elements, hide the section containing this custom element
          if (!this.isPreviewMode) this.wrapper.style.display = 'none';
        }
      } catch (e) {
        // Don't log errors for aborted requests
        if (e.name !== 'AbortError') {
          console.error('Error fetching recently viewed products:', e);
          if (!this.isPreviewMode) this.wrapper.style.display = 'none'; // Hide the element in case of error to avoid leaving an empty placeholder
        }
      }
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
        document.removeEventListener('shopify:section:load', this.debouncedRenderRecentlyViewedProductsBound);
      }
    }
  }

  customElements.define('recently-viewed-products', RecentlyViewedProducts);
}

/******/ })()
;