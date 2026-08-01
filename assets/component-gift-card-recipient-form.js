/******/ (() => { // webpackBootstrap
/* eslint-disable */
class RecipientForm extends HTMLElement {
  constructor() {
    super();

    /* ===== Cache the DOM elements and set the initial state of the form ===== */
    this.cacheDOMElements();
    this.sectionId = this.getAttribute('data-section-id');
    this.onTriggerClickBound = this.onTriggerClick.bind(this);
    this.resetFormFieldsBound = this.resetFormFields.bind(this);
  }

  cacheDOMElements() {
    this.formTrigger = this.querySelector('[data-recipient-form-trigger]');
    this.formWrapper = this.querySelector('[data-recipient-form-wrapper]');
    this.formInputs = this.formWrapper.querySelectorAll('input, textarea');
  }

  setEventListeners() {
    /* ===== Attach the event listeners to the DOM elements ===== */
    this.formTrigger.addEventListener('click', this.onTriggerClickBound);
    eventBus.on('cart:added', this.resetFormFieldsBound);
  }

  connectedCallback() {
    this.setEventListeners();
  }

  onTriggerClick() {
    /* ===== Handle the click event on the form trigger ===== */
    this.toggleForm();
  }

  resetFormFields(context) {
    /* ===== Reset the form fields when a product is added to the cart ===== */
    if (context.sectionId && context.sectionId !== this.sectionId) return;
    this.closeForm();
    this.formTrigger.checked = false;
    this.clearInputFields();
  }

  toggleForm() {
    /* ===== Toggle the form visibility and disable the form inputs ===== */
    this.formWrapper.style.display = this.formWrapper.style.display === 'none' ? 'flex' : 'none';
    // Toggle disabled attribute on form inputs
    this.formInputs.forEach(input => input.disabled = !input.disabled);
  }

  closeForm() {
    /* ===== Close the form and disable the form inputs ===== */
    this.formWrapper.style.display = 'none';
    this.formInputs.forEach(input => input.disabled = true);
  }

  clearInputFields() {
    /* ===== Clear the input fields of the form ===== */
    this.formInputs.forEach(input => input.value = '');
  }

  disconnectedCallback() {
    /* ===== Remove the event listeners when the element is removed from the DOM ===== */
    this.formTrigger.removeEventListener('click', this.onTriggerClickBound);
    eventBus.off('cart:added', this.resetFormFieldsBound);
  }
}

if (!customElements.get('recipient-form')) {
  customElements.define('recipient-form', RecipientForm);
}
/******/ })()
;