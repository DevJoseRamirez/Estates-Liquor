/******/ (() => { // webpackBootstrap
class CopyCode extends HTMLElement {
  constructor() {
    super();
    this.code = this.querySelector('[data-offers-drawer-code]');
    this.copyBtn = this.querySelector('[data-offers-drawer-copy-btn]');
    this.copyIcon = this.querySelector('[data-offers-drawer-copy-icon]');
    this.checkIcon = this.querySelector('[data-offers-drawer-check-icon]');
    this.selectCode = this.selectCode.bind(this);
    this.copyCode = this.copyCode.bind(this);
    this.handleCopySuccess = this.handleCopySuccess.bind(this);
  }

  connectedCallback() {
    if (this.code && this.copyBtn) {
      this.attachEvents();
    }
  }

  attachEvents() {
    this.code.addEventListener('click', this.selectCode);
    this.copyBtn.addEventListener('click', this.copyCode);
  }

  detachEvents() {
    this.code.removeEventListener('click', this.selectCode);
    this.copyBtn.removeEventListener('click', this.copyCode);
  }

  selectCode() {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(this.code);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  copyCode() {
    // Select the code
    this.selectCode();

    // Get the selected text
    const selectedText = window.getSelection().toString();

    if (navigator.clipboard?.writeText) {
      // Use Clipboard API if available and allowed
      navigator.clipboard.writeText(selectedText).then(() => {
        console.log('Copy successful');
        this.handleCopySuccess();
      }).catch(err => {
        console.log('Failed to copy: ', err);
      });
    }

    // Clear the selection after copying 
    window.getSelection().removeAllRanges();
  }

  handleCopySuccess() {
    if (!this.copyIcon || !this.checkIcon) return;

    this.copyIcon.classList.add('hide-icon');
    this.checkIcon.classList.remove('hide-icon');

    setTimeout(() => {
      this.copyIcon.classList.remove('hide-icon');
      this.checkIcon.classList.add('hide-icon');
    }, 1500);
  }

  disconnectedCallback() {
    if (this.code && this.copyBtn) {
      this.detachEvents();
    }
  }
}

customElements.define('copy-code', CopyCode);

/******/ })()
;