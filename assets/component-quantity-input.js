/******/ (() => { // webpackBootstrap
/* eslint-disable */
if (!customElements.get('quantity-input')) {
  customElements.define('quantity-input', class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.cacheDOMElements();
      this.bindEventHandlers();
    }

    cacheDOMElements() {
      /* ===== We need to cache the DOM elements in the constructor because the connectedCallback is called every time the element 
      is appended into the DOM ===== */
      this.input = this.querySelector('input');
      this.buttonMinus = this.querySelector("button[name='minus']");
      this.buttonPlus = this.querySelector("button[name='plus']");
      this.sectionId = this.getAttribute('data-section-id');
    }

    bindEventHandlers() {
      /* ===== Bind the event handlers in order to maintain the correct context of 'this' ===== */
      this.attachEventListeners = this.attachEventListeners.bind(this);
      this.detachEventListeners = this.detachEventListeners.bind(this);
      this.onButtonClick = this.onButtonClick.bind(this);
      this.onInput = this.debounce(this.onInput.bind(this), 500);
      this.onCartAdded = this.onCartAdded.bind(this);
    }

    connectedCallback() {
      this.attachEventListeners();
    }

    attachEventListeners() {
      /* ===== Attach the event listeners to the DOM elements ===== */
      this.buttonMinus.addEventListener('click', this.onButtonClick);
      this.buttonPlus.addEventListener('click', this.onButtonClick);
      this.input.addEventListener('input', this.onInput);
      eventBus.on('cart:added', this.onCartAdded);
    }

    debounce(func, wait, immediate) {
      /* ===== Debounce function to limit the rate at which a function is called ===== */
      let timeout;
      return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    onButtonClick(event) {
      /* ===== Handle the button click event ===== */
      event.preventDefault();
      const previousValue = this.input.value;
      const adjustment = event.currentTarget.name === 'plus' ? 1 : -1;

      // Adjust the quantity by the adjustment value
      this.adjustQuantity(adjustment);
      // Emit the qty:change event if the value has changed
      if (previousValue !== this.input.value) eventBus.emit('qty:change', { value: this.input.value, sectionId: this.sectionId });
    }

    onInput(event) {
      /* ===== Handle the input event ===== */
      event.preventDefault();

      // If the value is not a number, set it to 1
      if (isNaN(this.input.value)) {
        this.input.value = 1;
      }

      // If the value is smaller than the min attribute, set it to the min attribute
      if (this.input.min && parseInt(this.input.value) < parseInt(this.input.min)) {
        this.input.value = this.input.min;
      }

      // Emit the qty:change event
      eventBus.emit('qty:change', { value: this.input.value, sectionId: this.sectionId });
    }

    adjustQuantity(adjustment) {
      /* ===== Adjust the quantity by the adjustment value ===== */
      const newValue = parseInt(this.input.value) + adjustment;
      // If the new value is not a number, set it to 1
      this.input.value = isNaN(newValue) ? 1 : newValue;

      // If the value is smaller than the min attribute, set it to the min attribute
      if (this.input.min && parseInt(this.input.value) < parseInt(this.input.min)) {
        this.input.value = this.input.min;
      }
    }

    onCartAdded(data) {
      /* ===== Handle the cart:added event and reset the input value to 1 ===== */
      if (data.sectionId && data.sectionId === this.sectionId) {
        this.input.value = 1;
      }
    }

    disconnectedCallback() {
      /* ===== Detach the event listeners when the element is removed from the DOM ===== */
      this.detachEventListeners();
    }

    detachEventListeners() {
      /* ===== Detach the event listeners from the DOM elements ===== */
      this.buttonMinus.removeEventListener('click', this.onButtonClick);
      this.buttonPlus.removeEventListener('click', this.onButtonClick);
      this.input.removeEventListener('input', this.onInput);
    }
  });
}
/******/ })()
;