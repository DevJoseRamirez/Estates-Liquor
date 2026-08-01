/******/ (() => { // webpackBootstrap
class ParallaxSection extends HTMLElement {
  constructor() {
    super();
    this._observer = null;
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    this._img = this.querySelector('[data-parallax-image]');
    this._container = this.closest('[data-parallax-container]');
    this._isPreviewMode = this.getAttribute('data-is-preview-mode') === 'true';
    if (!this._img || !this._container || this._isPreviewMode) return;

    // IntersectionObserver => add scroll listener if in view
    this._observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        window.addEventListener('scroll', this._onScroll, { passive: true });
        // Immediately run _onScroll to avoid the first-time “jerk”
        this._onScroll();
      } else {
        window.removeEventListener('scroll', this._onScroll);
      }
    }, { threshold: 0 });

    this._observer.observe(this);
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._onScroll);
    this._observer?.disconnect();
  }

  _onScroll() {
    // Get the container’s position relative to the viewport
    const rect = this._container.getBoundingClientRect();
  
    // If it’s completely out of view, skip calculations
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      return;
    }
  
    // How tall the container is
    const containerHeight = this._container.offsetHeight;
  
    // The "base" position (50% down the container).
    // Using percentage for the base offset
    const BASE_OFFSET_PERCENT = 50;
  
    // Parallax factor: how much the image moves relative to scrolling
    const FACTOR = 3.5;
  
    // Determine if this is the first section
    const isFirstSection = this._container === document.querySelector('#MainContent .shopify-section:first-of-type [data-parallax-container]');

    // Calculate half of viewport height in pixels
    const halfViewportPx = Math.floor(window.innerHeight / 2);
  
    // Adjust buffer based on whether this is the first section
    const BUFFER = isFirstSection ? 0 : halfViewportPx;
    const scrolled = window.scrollY - this._container.offsetTop + BUFFER;
  
    // Calculate the scroll ratio relative to the container's height
    const scrollRatio = scrolled / containerHeight;
  
    // Calculate translateY in percentage
    let translateYPercent = BASE_OFFSET_PERCENT - (scrollRatio * FACTOR * 100);
  
    // Clamp the translateY to not exceed the base offset
    if (translateYPercent > BASE_OFFSET_PERCENT) {
      translateYPercent = BASE_OFFSET_PERCENT;
    }
  
    // Apply the negative translate to move the image upward as the user scrolls more
    this._img.style.transform = `translate3d(0, ${translateYPercent}%, 0)`;
  }
}

if (!customElements.get('parallax-section')) {
  customElements.define('parallax-section', ParallaxSection);
}
/******/ })()
;