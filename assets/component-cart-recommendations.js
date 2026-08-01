/******/ (() => { // webpackBootstrap
class CartRecommendations extends HTMLElement {
  constructor() {
    super();
    this.recommendationsDrawer = this.closest('[data-cart-drawer-recommendations]');
    this.fetchRecommendations = this.fetchRecommendations.bind(this);
    this.renderRecommendations = this.renderRecommendations.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-cart-recommendations'});
    this.fetchRecommendations();
  }

  async fetchRecommendations() {
    if (!this.url) return;
 
    try {
      const response = await fetch(this.url);
      
      if (response.ok) {
        const responseText = await response.text();
        this.renderRecommendations(responseText);
      }
    } catch (error) {
      console.error(`Failed to fetch cart drawer:`, error);
    }
  }

  renderRecommendations(html) {
    const updatedContent = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-recommendations')?.innerHTML;
    
    if (!updatedContent || updatedContent.trim().length === 0) {
      /* ===== If no recommendations, hide the secondary drawer ===== */
      this.closest('cart-drawer')?.classList.add('hide-recommendations');
    } else {
      /* ===== If recommendations, update content ===== */
      this.innerHTML = updatedContent;
      this.closest('cart-drawer')?.classList.remove('hide-recommendations');

      /* ===== Prevent mobile content shift with each fetch by fixing the parent height and re-calculating after each fetch ===== */
      if (window.matchMedia('only screen and (max-width: 767px)').matches) {
        this.parentElement.style.height = 'auto';
        this.parentHeight = this.parentElement.getBoundingClientRect().height;
        this.parentElement.style.height = '';
        document.documentElement.style.setProperty('--cart-recommendations-height', `${this.parentHeight}px`);
      }
    }
  }

  get url() {
    return this.getAttribute('data-cart-recommendations-url');
  }
}

customElements.define('cart-recommendations', CartRecommendations);
/******/ })()
;