/******/ (() => { // webpackBootstrap
/* eslint-disable no-undef */
if (!customElements.get('gift-card')) {
  class GiftCard extends HTMLElement {
    constructor() {
      super();
    }

    cacheDOMElements() {
      this.qrCodeEnabled = this.dataset.qrCodeEnabled === 'true';
      this.qrCode = this.qrCodeEnabled ? this.querySelector('[data-gift-card-qr-code]') : null;
      this.giftCardCode = this.querySelector('[data-gift-card-code]');
      this.copyBtn = this.querySelector('[data-copy-btn]');
      this.wethemeGlobal = document.querySelector('script#wetheme-global');
      this.translationsObject = JSON.parse(this.wethemeGlobal.textContent);
    }

    addEventListeners() {
      this.giftCardCode.addEventListener('click', this.selectGiftCardCode.bind(this));
      this.giftCardCode.addEventListener('focus', this.selectGiftCardCode.bind(this));
      this.copyBtn.addEventListener('click', this.copyGiftCardCode.bind(this));
    }

    connectedCallback() {
      this.cacheDOMElements();
      this.addEventListeners();
      if (this.qrCodeEnabled) this.generateQRCode();
    }

    generateQRCode() {
      if (!this.qrCode) return;

      // Generate QR code for the gift card
      new QRCode( this.qrCode, {
        text: this.qrCode.dataset.identifier,
        width: 100,
        height: 100,
        imageAltText: this.translationsObject.translations.qr_image_alt
      });
    }

    selectGiftCardCode() {
      // Select the gift card code when clicked
      const range = document.createRange();
      const selection = window.getSelection();

      range.selectNodeContents(this.giftCardCode);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    copyGiftCardCode() {
      // Select the gift card code first
      this.selectGiftCardCode();

      // Get the selected text
      const selectedText = window.getSelection().toString();

      if (navigator.clipboard?.writeText) {
        // Use Clipboard API if available and allowed
        navigator.clipboard.writeText(selectedText).then(() => {
          console.log('Copy successful');
        }).catch(err => {
          console.log('Failed to copy: ', err);
        });
      }

      // Clear the selection after copying 
      window.getSelection().removeAllRanges();
    }

    disconnectedCallback() {
      this.giftCardCode.removeEventListener('click', this.selectGiftCardCode);
      this.copyBtn.removeEventListener('click', this.copyGiftCardCode);
    }
  }
  customElements.define('gift-card', GiftCard);
}

/******/ })()
;