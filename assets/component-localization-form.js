/******/ (() => { // webpackBootstrap
var isDefined = customElements.get('localization-form');

if (!isDefined) {
  class LocalizationForm extends HTMLElement {
    constructor() {
      super();

      this.thing = 0;
      this.isPanelOpen = false;

      this.elements = {
        input: this.querySelector('input[name="language_code"],input[name="country_code"]'),
        button: this.querySelector('button'),
        panel: this.querySelector('ul'),
      };

      this.elements.button.addEventListener('click', this.togglePanel.bind(this));
      this.elements.button.addEventListener('focusout', this.handleFocusOut.bind(this));
      this.elements.panel.addEventListener('focusout', this.handleFocusOut.bind(this));
      document.addEventListener('mousedown', this.handleDocumentClick.bind(this));
      this.addEventListener('keyup', this.onContainerKeyUp.bind(this));

      this.querySelectorAll('a').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
    }

    handleDocumentClick(event) {
      if (!this.contains(event.target)) {
        this.hidePanel();
      }
    }

    handleFocusOut(event) {
      // Only handle focusout if the focus is moving outside the component
      if (!this.contains(event.relatedTarget)) {
        this.hidePanel();
      }
    }

    hidePanel() {
      this.isPanelOpen = false;
      this.elements.button.setAttribute('aria-expanded', 'false');
      this.elements.panel.setAttribute('hidden', true);
    }

    showPanel() {
      this.isPanelOpen = true;
      this.elements.button.setAttribute('aria-expanded', 'true');
      this.elements.panel.removeAttribute('hidden');
    }

    togglePanel(event) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.isPanelOpen) {
        this.hidePanel();
      } else {
        this.showPanel();
      }
    }

    onContainerKeyUp(event) {
      if (event.code.toUpperCase() !== 'ESCAPE') return;

      this.hidePanel();
      this.elements.button.focus();
    }

    onItemClick(event) {
      event.preventDefault();
      const form = this.querySelector('form');
      this.elements.input.value = event.currentTarget.dataset.value;
      if (form) form.submit();
    }
  }

  customElements.define('localization-form', LocalizationForm);
}
/******/ })()
;