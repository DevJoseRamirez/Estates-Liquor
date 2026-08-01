/******/ (() => { // webpackBootstrap

class StockLevelIndicator extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['data-flow-variant-id'];
  }

  attributeChangedCallback(attribute, oldVal, newVal) {
    if(!oldVal || oldVal === newVal) return;
  }

  connectedCallback() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver(this.intersected, { threshold: 1 });
    observer.observe(this);
  }

  intersected(entry, observer) {
    if (entry[0].isIntersecting) {
      entry[0].target.classList.add('animate-bar');
      observer.unobserve(entry[0].target);
    }
  }
}

if (!customElements.get('stock-level-indicator')) customElements.define('stock-level-indicator', StockLevelIndicator);

/******/ })()
;