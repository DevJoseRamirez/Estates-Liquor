/******/ (() => { // webpackBootstrap
/* eslint-disable */
if (!customElements.get('out-of-stock-form')) {
  customElements.define('out-of-stock-form',
  class OutOfStockForm extends HTMLElement {
    constructor() {
      super();
      
      this.cacheDOMElements();
      this.onClickBound = this.onClick.bind(this);
    }

    cacheDOMElements() {
      this.formRevealLink = this.querySelector('[data-form-reveal-link]');
      this.formInputWrapper = this.querySelector('[data-form-input-wrapper]');
    }

    connectedCallback() {
      this.attachEventListeners();
    }

    disconnectedCallback() {
      this.formRevealLink.removeEventListener('click', this.onClickBound);
    }

    attachEventListeners() {
      this.formRevealLink.addEventListener('click', this.onClickBound);
    }

    onClick(event) {
      event.preventDefault();
      // Toggle the form input wrapper
      this.formInputWrapper.style.display = this.formInputWrapper.style.display === 'none' ? 'flex' : 'none';
    }
  });
}
/******/ })()
;