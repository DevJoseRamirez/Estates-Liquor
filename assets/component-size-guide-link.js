/******/ (() => { // webpackBootstrap
/* eslint-disable */
if (!customElements.get('size-guide-link')) {
  customElements.define('size-guide-link',
  class SizeGuideLink extends HTMLElement {
    constructor() {
      super();
      
      this.cacheDOMElements();
      this.handleClickBound = this.handleClick.bind(this);
    }

    cacheDOMElements() {
      this.sizeGuideLink = this.querySelector('[data-size-guide-link]');
    }

    connectedCallback() {
      this.sizeGuideLink.addEventListener('click', this.handleClickBound);
    }

    disconnectedCallback() {
      this.sizeGuideLink.removeEventListener('click', this.handleClickBound);
    }

    handleClick(event) {
      event.preventDefault();
      // Open the size guide drawer with the URL
      window.eventBus.emit('open:size:guide', { url: event.currentTarget.href });
    }
  });
}
/******/ })()
;