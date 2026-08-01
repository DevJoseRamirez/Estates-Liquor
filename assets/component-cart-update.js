/******/ (() => { // webpackBootstrap
class CartUpdate extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('textarea');
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-cart-update'});
    if (!this.input) return;
    this.input.addEventListener('change', this.handleInputChange);
  }

  handleInputChange(e) {
    /* ===== Update the cart ===== */
    const name = e.target.name;
    const value = e.target.value;

    const bodyObj = this.fetchBody(name, value);
    if (!bodyObj) return;

    fetch(window.routes.cart_update_url, { 
      ...this.fetchConfig(),
      body: JSON.stringify(bodyObj),
      keepalive: true
    });
  }

  fetchBody(name, value) {
    /* ===== Cart note update ===== */
    if (name === 'note') {
      return { note: value };
    }

    /* ===== Cart attribute update ===== */
    const match = name.match(/^attributes\[(\w+)\]$/);
    if (match) {
      return { attributes: { [match[1]]: value } };
    }

    return null;
  }

  fetchConfig(type = 'json') {
    /* ===== Create the fetch configuration object ===== */
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
    };
  }
}

customElements.define('cart-update', CartUpdate);
/******/ })()
;