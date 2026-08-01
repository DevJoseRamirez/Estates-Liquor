/******/ (() => { // webpackBootstrap
class CartUpdateModal extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('textarea');
    this.label = this.querySelector('[data-cart-update-label]');
    this.openButton = this.querySelector('[data-cart-update-open]');
    this.openButtonText = this.querySelector('[data-cart-update-open-text]');
    this.closeButtons = this.querySelectorAll('[data-cart-update-close]');
    this.modal = this.querySelector('[data-cart-update-modal]');
    this.overlay = this.querySelector('[data-cart-update-overlay]');
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.trapFocus = this.trapFocus.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-cart-update-modal'});
    if (!this.input) return;
    this.inputValue = this.input.value;
    this.input.addEventListener('change', this.handleInputChange);
    this.openButton.addEventListener('click', this.handleOpen);
    this.modal.addEventListener('transitionend', this.handleTransitionEnd);
    this.addEventListener('keyup', this.handleEscape, true);
    this.closeButtons.forEach(button => button.addEventListener('click', this.handleClose));
  }

  handleInputChange(e) {
    /* ===== Keep track of input value to handle add/edit labels ===== */
    this.inputValue = e.target.value;
  }

  handleOpen() {
    /* ===== Open modal ===== */
    this.setAttribute('open', true);
    this.modal.setAttribute('aria-hidden', false);

    /* ===== Set input label text content - add or edit ===== */
    const labelText = this.inputValue ? this.editLabelText : this.addLabelText;
    this.label.textContent = labelText;
  }

  handleTransitionEnd(e) {
    /* ===== Trap focus once modal is fully open ===== */
    if (e.target === this.modal) {
      this.trapFocus();
    }
  }

  handleClose() {
    /* ===== Close modal ===== */
    this.removeAttribute('open');
    this.modal.setAttribute('aria-hidden', true);

    /* ===== Set open button text content - add or edit ===== */
    const labelText = this.inputValue ? this.editLabelText : this.addLabelText;
    this.openButtonText.textContent = labelText;
  }

  trapFocus() {
    const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
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

  handleEscape(e) {
    /* ===== Close modal when escape key is pressed ===== */
    if (e.key === 'Escape') {
      this.inputValue = this.input.value;
      e.stopPropagation(); // Prevent the drawer from closing
      this.handleClose();
    }
  }

  get addLabelText() {
    return this.getAttribute('data-add-label');
  }

  get editLabelText() {
    return this.getAttribute('data-edit-label');
  }
}

customElements.define('cart-update-modal', CartUpdateModal);
/******/ })()
;