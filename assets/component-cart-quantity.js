/******/ (() => { // webpackBootstrap
class CartQuantity extends HTMLElement {
  constructor() {
    super();
    this.removeButton = this.querySelector('[data-cart-remove-item]');
    this.adjustButtons = this.querySelectorAll('[data-cart-quantity-button]');
    this.input = this.querySelector('[data-cart-quantity-input]');
    this.cartCountIndicator = document.querySelector('[data-cart-count-indicator]');
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.updateCart = this.updateCart.bind(this);
    this.updateLineItem = this.updateLineItem.bind(this);
    this.updateCartCountIndicator = this.updateCartCountIndicator.bind(this);
    this.handleCartErrors = this.handleCartErrors.bind(this);
    this.setLoadingState = this.setLoadingState.bind(this);
    this.hideLoadingState = this.hideLoadingState.bind(this);
    this.setRemoveLoadingState = this.setRemoveLoadingState.bind(this);
    this.hideRemoveLoadingState = this.hideRemoveLoadingState.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-cart-quantity'});
    this.removeButton?.addEventListener('click', this.handleRemoveItem);
    this.adjustButtons.forEach(button => button.addEventListener('click', this.handleButtonClick));
    this.input?.addEventListener('change', this.handleInputChange);
  }

  handleButtonClick(e) {
    /* ===== Handle the button click event ===== */
    e.preventDefault();
    const previousValue = this.input.value;
    const adjustment = e.currentTarget.name === 'plus' ? 1 : -1;

    // Adjust the quantity by the adjustment value
    this.adjustQuantity(adjustment);

    // Process the new quantity if quantity has changed
    if (previousValue !== this.input.value) {
      this.handleQuantityChange(this.input.value);
    }
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

  handleInputChange(e) {
    /* ===== Handle the change event ===== */
    e.preventDefault();

    // If the value is not a number, set it to 1
    if (isNaN(this.input.value)) {
      this.input.value = 1;
    }

    // If the value is smaller than the min attribute, set it to the min attribute
    if (this.input.min && parseInt(this.input.value) < parseInt(this.input.min)) {
      this.input.value = this.input.min;
    }

    // Process the new quantity
    this.handleQuantityChange(this.input.value);
  }

  handleQuantityChange(inputValue) {
    /* ===== Update the cart with the new quantity ===== */
    const quantity = parseInt(inputValue);
    this.updateCart(this.itemIndex, quantity);
  }

  handleRemoveItem() {
    /* ===== Set quantity of line item to zero ===== */
    this.updateCart(this.itemIndex, 0);
  }

  async updateCart(line, quantity) {
    try {
      /* ===== Set the loading state ===== */
      this.setLoadingState();

      /* ===== If quantity is 0, set the 'remove' loading state ===== */
      if (quantity === 0) {
        this.setRemoveLoadingState();
      }

      /* ===== Update the line item quantity ===== */
      let response = await this.updateLineItem(line, quantity);
      if (!response) return;

      /* ===== If successful response and has gift wrap, update the gift wrap product quantity ===== */
      if (this.hasGiftWrap) {
        const adjustment = quantity - this.previousQuantity;
        const cart = await this.getCart();
        if (this.getGiftWrapLine(cart) && this.getGiftWrapQuantity(cart)) {
          response = await this.updateLineItem(this.getGiftWrapLine(cart), this.getGiftWrapQuantity(cart) + adjustment);
        }
      }
      if (!response) return;

      /* ===== If successful response, re-render the cart ===== */
      window.eventBus.emit('update:cart:drawer', response);

      /* ===== Update cart count ===== */
      this.updateCartCountIndicator();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  async updateLineItem(line, quantity) {
    try {
      /* ===== Update line item quantity ===== */
      const body = JSON.stringify({
        line,
        quantity,
        sections: 'cart-drawer'
      });

      const response = await fetch(window.routes.cart_change_url, { 
        ...this.fetchConfig(),
        body
      });

      const responseText = await response.text();

      if (!responseText) {
        this.handleCartErrors();
        return null;
      }

      const parsedResponse = JSON.parse(responseText);

      /* ===== Handle errors ===== */
      if (parsedResponse.errors) {
        this.handleCartErrors(line, parsedResponse.errors);
        return null;
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error updating cart line item:', error);
    }
  }

  fetchConfig(type = 'json') {
    /* ===== Create the fetch configuration object ===== */
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
    };
  }

  handleCartErrors(line, errors) {
    /* ===== Reset loading state and input value ===== */
    this.hideLoadingState();
    this.hideRemoveLoadingState();
    this.input.value = this.input.getAttribute('value');

    /* ===== Display the error message ===== */
    this.renderErrorMessage(line, errors);
  }

  renderErrorMessage(line, message) {
    /* ===== Display the error message ===== */
    const errorElement = document.querySelector(`[data-cart-error-index="${line}"]`);
    if (!errorElement) return;
    errorElement.innerHTML = message;
    errorElement.setAttribute('aria-hidden', false);

    /* ===== If we're at the bottom of the cart, scroll error message into view ===== */
    const isLastItem = errorElement.getAttribute('data-cart-is-last-item') === 'true';
    if (isLastItem) {
      errorElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async getCart() {
    /* ===== Fetch the cart information ===== */
    try {
      const response = await fetch(`${window.routes.cart_url}?view=compare`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching cart: ${error.description || error.message}`);
    }
  }

  updateCartCountIndicator() {
    /* ===== Update the cart count indicator ===== */
    if (!this.cartCountIndicator) return;
    this.getCart().then(cart => window.wetheme.updateCartCount(cart));
  }

  getGiftWrapLine(cart) {
    return cart.items.findIndex(item => item.variant_id === this.giftWrapVariantId) + 1 || null;
  }

  getGiftWrapQuantity(cart) {
    return cart.items.find(item => item.variant_id === this.giftWrapVariantId)?.quantity || null;
  }

  setLoadingState() {
    this.classList.add('is-loading');
  }

  hideLoadingState() {
    this.classList.remove('is-loading');
  }

  setRemoveLoadingState() {
    this.classList.add('is-removing');
  }

  hideRemoveLoadingState() {
    this.classList.remove('is-removing');
  }

  get itemIndex() {
    return parseInt(this.getAttribute('data-item-index'));
  }

  get previousQuantity() {
    return parseInt(this.getAttribute('data-item-quantity'));
  }

  get hasGiftWrap() {
    return this.getAttribute('data-has-gift-wrap') === "true";
  }

  get giftWrapVariantId() {
    return parseInt(this.getAttribute('data-gift-wrap-variant-id'));
  }
}

customElements.define('cart-quantity', CartQuantity);
/******/ })()
;