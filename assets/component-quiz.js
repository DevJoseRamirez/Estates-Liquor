/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/javascripts/utils.js
/**
 * Throttle execution of function
 *
 * @param {Function} callback function to be throttled
 * @param {number} interval milliseconds
 * @returns {Function}
 */
function throttle(callback, interval) {
  let enableCall = true;
  let calledWhenDisabled = false;


  return (...args) =>{
    const onTimeout = () => {
      if (calledWhenDisabled) {
        callback.apply(this, args);
        setTimeout(onTimeout, interval);
      } else {
        enableCall = true;
      }
      calledWhenDisabled = false;
    }

    if (!enableCall) {
      calledWhenDisabled = true;
      return;
    }

    enableCall = false;
    callback.apply(this, args);
    setTimeout(onTimeout, interval);
  }
}

/**
 * Take monetary value and format it as money
 *
 * @param {number | string} cents - Price in cents (hundreds of base unit)
 * @param {string} [format] - Format for money; store format will be used if undefined
 * @return {string} - HTML string with the formatted money value
 */
function formatMoney(cents, format) {
  var moneyFormat = format || '${{amount}}';
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = moneyFormat;

  function formatWithDelimiters(number, precision, thousands, decimal) {
    if (precision === null || precision === undefined) {
      precision = 2;
    }
    thousands = thousands || ',';
    decimal = decimal || '.';

    if (isNaN(number) || number == null) {
      return '0';
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.');
    var dollarsAmount = parts[0].replace(
      /(\d)(?=(\d{3})+(?!\d))/g,
      '$1' + thousands
    );
    var centsAmount = parts[1] ? decimal + parts[1] : '';

    return dollarsAmount + centsAmount;
  }

  var match = formatString.match(placeholderRegex);

  if (!match) {
    throw new Error(
      `Invalid format string: '${formatString}'. Expected '{{amount}}' or similar placeholders.`
    );
  }

  switch (match[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_with_space_separator':
      value = formatWithDelimiters(cents, 2, ' ', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    case 'amount_no_decimals_with_space_separator':
      value = formatWithDelimiters(cents, 0, ' ');
      break;
    default:
      throw new Error(`Unknown format type: ${match[1]}`);
  }

  return formatString.replace(placeholderRegex, value);
}

// FocusTrap class for managing focus within a container
class FocusTrap {
  /**
   * @param {HTMLElement} container - The container within which to trap focus.
   * @param {HTMLElement} [initialElement=null] - The element to focus initially. If not provided, the first focusable element is focused.
   * @param {Function} [onEscape=null] - Optional callback to execute when the Escape key is pressed.
   */
  constructor(container, initialElement = null, onEscape = null) {
    this.container = container;
    this.initialElement = initialElement;
    this.onEscape = onEscape;
    this.focusableElements = [];
    this.firstElement = null;
    this.lastElement = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.updateFocusableElements = this.updateFocusableElements.bind(this);
    this.observer = new MutationObserver(this.updateFocusableElements);
    this.init();
  }

  /**
   * Initializes the focus trap by removing the 'inert' attribute,
   * updating focusable elements, setting initial focus, and attaching necessary event listeners.
   */
  init() {
    if (!this.container) return;

    // Remove the 'inert' attribute from the container
    this.container.removeAttribute('inert');

    this.updateFocusableElements();

    if (this.initialElement && this.isFocusable(this.initialElement)) {
      this.initialElement.focus();
    } else if (this.firstElement) {
      this.firstElement.focus();
    }

    this.container.addEventListener('keydown', this.handleKeyDown);
    this.observer.observe(this.container, { childList: true, subtree: true, attributes: true });
  }

  /**
   * Determines if an element is focusable.
   * @param {HTMLElement} el - The element to check.
   * @returns {boolean} - True if the element is focusable, else false.
   */
  isFocusable(el) {
    if (!el) return false;
    return (
      el.offsetParent !== null &&
      el.getAttribute('tabindex') !== '-1' &&
      !this.isInsideClosedDetails(el)
    );
  }

  /**
   * Determines if an element is inside a closed <details> element.
   * Allows <summary> elements to remain focusable even if their parent <details> is closed.
   * @param {HTMLElement} el - The element to check.
   * @returns {boolean} - True if inside a closed <details> and not a <summary>, else false.
   */
  isInsideClosedDetails(el) {
    let parent = el.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === 'details') {
        if (!parent.hasAttribute('open')) {
          // Allow the <summary> element itself to be focusable
          if (el.tagName.toLowerCase() === 'summary' && parent.querySelector('summary') === el) {
            return false;
          }
          return true;
        }
      }
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Updates the list of focusable elements, excluding those inside closed <details> (except <summary>).
   */
  updateFocusableElements() {
    this.focusableElements = Array.from(this.container.querySelectorAll(
      'a[href], area[href], input:not([type=hidden]), select, textarea, button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], summary'
    )).filter(el => this.isFocusable(el));

    if (this.focusableElements.length > 0) {
      this.firstElement = this.focusableElements[0];
      this.lastElement = this.focusableElements[this.focusableElements.length - 1];
    } else {
      this.firstElement = null;
      this.lastElement = null;
      console.warn('No focusable elements found within the container.');
    }
  }

  /**
   * Handles the keydown event to trap focus within the container.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  handleKeyDown(e) {
    if (e.key === 'Tab') {
      if (this.focusableElements.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === this.firstElement) {
          e.preventDefault();
          this.lastElement.focus();
        }
      } else { // Tab
        if (document.activeElement === this.lastElement) {
          e.preventDefault();
          this.firstElement.focus();
        }
      }
    } else if (e.key === 'Escape') {
      if (this.onEscape) {
        this.onEscape();
      }
    }
  }

  /**
   * Destroys the focus trap by removing event listeners and disconnecting observers.
   */
  destroy() {
    this.container.setAttribute('inert', '');
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.observer.disconnect();
  }
}

/**
 * CartManager - Centralized cart management utility for adding products to cart
 * Handles both single and multiple product additions with proper loading states,
 * cart drawer updates, and success messaging
 */
class CartManager {
  constructor() {
    this.cartType = document.getElementById('PageContainer')?.dataset.cartType;
    this.cartAction = document.getElementById('PageContainer')?.dataset.cartAction;
    this.languageUrl = document.getElementById('PageContainer')?.dataset.languageUrl;
    this.cartCountIndicator = document.querySelector('[data-cart-count-indicator]');
    
    // Get translations object
    this.wethemeGlobal = document.querySelector('script#wetheme-global');
    this.translations = this.wethemeGlobal ? JSON.parse(this.wethemeGlobal.textContent).translations : {};
  }

  /**
   * Add a single product to cart (equivalent to QuickAdd functionality)
   * @param {HTMLFormElement|FormData|Object} formOrData - Form element, FormData, or object with variant data
   * @param {HTMLElement} button - Button element for loading states
   * @param {Object} options - Additional options
   * @returns {Promise<Response>}
   */
  async addSingleProduct(formOrData, button, options = {}) {
    let variantId, quantity = 1;
    
    // Extract variant data based on input type
    if (formOrData instanceof HTMLFormElement) {
      const formData = new FormData(formOrData);
      variantId = formData.get('id');
      quantity = parseInt(formData.get('quantity') || '1', 10);
    } else if (formOrData instanceof FormData) {
      variantId = formOrData.get('id');
      quantity = parseInt(formOrData.get('quantity') || '1', 10);
    } else if (typeof formOrData === 'object') {
      variantId = formOrData.id || formOrData.variantId;
      quantity = formOrData.quantity || 1;
    }

    if (!variantId) {
      throw new Error('No variant ID provided');
    }

    const items = [{
      id: parseInt(variantId, 10),
      quantity
    }];

    return this.addItemsToCart(items, button, options);
  }

  /**
   * Add multiple products to cart
   * @param {Array} items - Array of {id, quantity} objects
   * @param {HTMLElement} button - Button element for loading states
   * @param {Object} options - Additional options
   * @returns {Promise<Response>}
   */
  async addMultipleProducts(items, button, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('No items provided or invalid items array');
    }

    return this.addItemsToCart(items, button, options);
  }

  /**
   * Core method to add items to cart with fallback to individual additions
   * @param {Array} items - Array of {id, quantity} objects
   * @param {HTMLElement} button - Button element for loading states
   * @param {Object} options - Additional options
   * @returns {Promise<Response>}
   */
  async addItemsToCart(items, button, options = {}) {
    if (button) {
      this.showLoadingState(button);
    }

    try {
      // Try bulk add first
      const response = await this.performBulkAdd(items);
      
      if (response.ok) {
        await this.handleSuccess(button, response, options);
        return response;
      } else if (response.status === 422) {
        // Inventory error - try individual adds
        console.warn('Bulk add failed due to inventory constraints, trying individual adds...');
        const individualResponse = await this.addItemsIndividually(items);
        await this.handleSuccess(button, individualResponse, options);
        return individualResponse;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.description || 'Failed to add items to cart');
      }
    } catch (error) {
      // If bulk add fails, try individual adds
      console.warn('Bulk add failed, trying individual adds...', error);
      try {
        const individualResponse = await this.addItemsIndividually(items);
        await this.handleSuccess(button, individualResponse, options);
        return individualResponse;
      } catch (individualError) {
        if (button) {
          this.hideLoadingState(button);
        }
        throw individualError;
      }
    }
  }

  /**
   * Perform bulk cart addition
   * @param {Array} items - Array of {id, quantity} objects
   * @returns {Promise<Response>}
   */
  async performBulkAdd(items) {
    const payload = { items };
    
    // Add sections parameter for cart drawer
    if (this.cartType === 'drawer') {
      payload.sections = 'cart-drawer';
    }
    
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    };
    
    return fetch(window.routes.cart_add_url, config);
  }

  /**
   * Add items individually with error handling
   * @param {Array} items - Array of {id, quantity} objects
   * @returns {Promise<Response>}
   */
  async addItemsIndividually(items) {
    let lastSuccessfulResponse = null;
    let successfullyAdded = 0;
    let skippedItems = 0;

    for (const item of items) {
      try {
        const payload = { items: [item] };
        
        if (this.cartType === 'drawer') {
          payload.sections = 'cart-drawer';
        }
        
        const config = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        };
        
        const response = await fetch(window.routes.cart_add_url, config);
        
        if (response.ok) {
          successfullyAdded++;
          lastSuccessfulResponse = response;
        } else if (response.status === 422) {
          skippedItems++;
          console.warn(`Skipping item ${item.id} due to inventory constraints`);
        } else {
          const errorData = await response.json();
          console.error(`Failed to add item ${item.id}:`, errorData.description || 'Unknown error');
          skippedItems++;
        }
      } catch (error) {
        console.error(`Error adding item ${item.id}:`, error);
        skippedItems++;
      }
    }

    if (successfullyAdded === 0) {
      throw new Error('No items could be added to cart');
    }

    if (skippedItems > 0) {
      console.info(`Successfully added ${successfullyAdded} items, skipped ${skippedItems} items due to inventory or other issues`);
    }

    return lastSuccessfulResponse || { ok: true, status: 200 };
  }

  /**
   * Handle successful cart addition
   * @param {HTMLElement} button - Button element
   * @param {Response} response - Fetch response
   * @param {Object} options - Additional options
   */
  async handleSuccess(button, response, options = {}) {
    if (button) {
      this.hideLoadingState(button);
    }

    // Update cart drawer if needed
    if (this.cartType === 'drawer' && response && response.ok) {
      try {
        const responseJson = await response.clone().json();
        this.updateCartDrawer(responseJson);
      } catch (error) {
        // Response might already be consumed, continue without drawer update
        console.warn('Could not parse response for cart drawer update:', error);
      }
    }

    // Emit cart added event
    if (window.eventBus && options.sectionId) {
      window.eventBus.emit('cart:added', { sectionId: options.sectionId });
    }

    // Handle cart action and update count
    if (button) {
      this.handleCartAction(button);
    } else {
      this.updateCartCountIndicator();
    }
  }

  /**
   * Update cart drawer
   * @param {Object} responseJson - Cart response data
   */
  updateCartDrawer(responseJson) {
    if (window.eventBus) {
      window.eventBus.emit('update:cart:drawer', responseJson);
    }
  }

  /**
   * Handle cart action based on settings
   * @param {HTMLElement} button - Button element
   */
  handleCartAction(button) {
    if (this.cartType === 'drawer') {
      if (this.cartAction === 'show_added_message') {
        this.showAddedMessage(button);
        this.updateCartCountIndicator();
      } else if (this.cartAction === 'go_to_or_open_cart') {
        if (window.eventBus) {
          window.eventBus.emit('open:cart:drawer', { scrollToTop: true });
        }
        this.updateCartCountIndicator();
      }
    } else {
      if (this.cartAction === 'show_added_message') {
        this.showAddedMessage(button);
        this.updateCartCountIndicator();
      } else {
        window.location = window.routes.cart_url;
      }
    }
  }

  /**
   * Show "Added" message on button
   * @param {HTMLElement} button - Button element
   */
  showAddedMessage(button) {
    const addedTranslation = this.translations.added;
    
    // Check if this button uses the dynamic-section-button structure
    const buttonText = button.querySelector('[data-button-text]');
    const addedText = button.querySelector('[data-cart-added-text]');
    
    if (buttonText && addedText) {
      // Dynamic section button with added text support
      buttonText.style.visibility = 'hidden';
      addedText.style.display = 'block';
      
      setTimeout(() => {
        addedText.style.display = 'none';
        buttonText.style.visibility = '';
        button.disabled = false;
      }, 2000);
    } else if (buttonText) {
      // Dynamic section button without added text - create temporary overlay
      buttonText.style.visibility = 'hidden';
      
      const tempAddedText = document.createElement('span');
      tempAddedText.textContent = addedTranslation;
      tempAddedText.style.gridColumn = '1';
      tempAddedText.style.gridRow = '1';
      tempAddedText.classList.add('temp-added-text');
      button.appendChild(tempAddedText);
      
      setTimeout(() => {
        buttonText.style.visibility = '';
        tempAddedText.remove();
        button.disabled = false;
      }, 2000);
    } else {
      // Regular button - hide original content and overlay "Added" text
      const originalHTML = button.dataset.originalText || button.innerHTML;
      
      const originalContent = button.innerHTML;
      button.innerHTML = '';
      
      const hiddenContent = document.createElement('span');
      hiddenContent.innerHTML = originalContent;
      hiddenContent.style.visibility = 'hidden';
      hiddenContent.style.gridColumn = '1';
      hiddenContent.style.gridRow = '1';
      
      const addedContent = document.createElement('span');
      addedContent.textContent = addedTranslation;
      addedContent.style.gridColumn = '1';
      addedContent.style.gridRow = '1';
      addedContent.classList.add('temp-added-text');
      
      button.appendChild(hiddenContent);
      button.appendChild(addedContent);
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 2000);
    }
  }

  /**
   * Update cart count indicator
   */
  async updateCartCountIndicator() {
    if (!this.cartCountIndicator) return;
    
    try {
      const languageParam = !this.languageUrl || this.languageUrl === '/' ? '' : this.languageUrl;
      const response = await fetch(`${languageParam}/cart?view=compare`);
      const cart = await response.json();
      if (window.wetheme?.updateCartCount) {
        window.wetheme.updateCartCount(cart);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  /**
   * Show loading state on button
   * @param {HTMLElement} button - Button element
   */
  showLoadingState(button) {
    button.disabled = true;
    button.classList.add('loading');
    
    const buttonText = button.querySelector('[data-button-text]');
    const loadingIcon = button.querySelector('[data-loading-icon]');
    
    if (buttonText && loadingIcon) {
      // Dynamic section button with loading icon structure
      buttonText.style.visibility = 'hidden';
      loadingIcon.classList.remove('hidden');
    } else {
      // Regular button - store original text and show loading icon
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      button.innerHTML = `<svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" class="spin flex-full"><g clip-path="url(#clip0_3605_47041)"><path d="M12.5 23C6.42487 23 1.5 18.0751 1.5 12C1.5 5.92487 6.42487 1 12.5 1C18.5751 1 23.5 5.92487 23.5 12C23.5 15.1767 22.1534 18.0388 20 20.0468" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></g><defs><clipPath id="clip0_3605_47041"><rect width="24" height="24" fill="none" transform="translate(0.5)"/></clipPath></defs></svg>`;
    }
  }

  /**
   * Hide loading state on button
   * @param {HTMLElement} button - Button element
   */
  hideLoadingState(button) {
    button.disabled = false;
    button.classList.remove('loading');
    
    const buttonText = button.querySelector('[data-button-text]');
    const loadingIcon = button.querySelector('[data-loading-icon]');
    
    if (buttonText && loadingIcon) {
      // Dynamic section button with loading icon structure
      buttonText.style.visibility = '';
      loadingIcon.classList.add('hidden');
    } else {
      // Regular button - restore original text
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  }
}

;// ./src/unique_sections/quiz/quiz.js


class Quiz extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.getAttribute('data-section-id');
    this.productHandles = this.getAttribute('data-product-handles');
    this.productsToShow = parseInt(this.getAttribute('data-products-to-show'), 10) || 3;
    this.accumulatedHandles = [];
    this.currentQuestionIndex = 0;
    this.init = this.init.bind(this);
    this.fetchProductData = this.fetchProductData.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.sortHandlesByFrequency = this.sortHandlesByFrequency.bind(this);
    this.handleQuickAddClick = this.handleQuickAddClick.bind(this);
    this.showQuestion = this.showQuestion.bind(this);
    this.hideAllQuestions = this.hideAllQuestions.bind(this);
    this.showResults = this.showResults.bind(this);
    this.showLoadingOverlay = this.showLoadingOverlay.bind(this);
    this.hideLoadingOverlay = this.hideLoadingOverlay.bind(this);
    this.resetQuizState = this.resetQuizState.bind(this);
    this.showPlaceholderProductCards = this.showPlaceholderProductCards.bind(this);
    this.handleSectionUnload = this.handleSectionUnload.bind(this);
    this.handleSectionSelect = this.handleSectionSelect.bind(this);
    this.handleBlockSelect = this.handleBlockSelect.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.cartManager = new CartManager();
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-quiz'});
    this.init();
  }

  init() {
    // Add event listeners to buttons
    const buttons = this.querySelectorAll('[data-quiz-button]');
    buttons.forEach(button => {
      button.addEventListener('click', this.handleButtonClick);
    });
    
    // Initialize quiz state - show only first/current question
    if (window.Shopify.designMode) {
      this.currentQuestionIndex = parseInt(document.body.getAttribute('data-quiz-block-load'), 10) || 0;
      // Reset state
      setTimeout(() => {
        document.body.removeAttribute('data-quiz-block-load');
      }, 1000);
    }
    this.hideAllQuestions();
    this.showQuestion(this.currentQuestionIndex);

    if (window.Shopify.designMode) {
      window.addEventListener('shopify:section:unload', this.handleSectionUnload);
      window.addEventListener('shopify:section:select', this.handleSectionSelect);
      window.addEventListener('shopify:block:select', this.handleBlockSelect);
    }
  }

  hideAllQuestions() {
    const questions = this.querySelectorAll('[data-quiz-question]');
    const results = this.querySelector('[data-quiz-product-cards]');
    
    questions.forEach(question => {
      question.classList.add('is-hidden');
    });
    
    if (results) {
      results.classList.add('is-hidden');
    }
  }

  showQuestion(index) {
    const questions = this.querySelectorAll('[data-quiz-question]');
    if (questions[index]) {
      questions[index].classList.remove('is-hidden');
    }
  }

  showResults() {
    const results = this.querySelector('[data-quiz-product-cards]');
    if (!results) return;
    results.classList.remove('is-hidden');

    const productCards = results.querySelectorAll('[data-quiz-product-card]');
    if (productCards.length > 0) {
      productCards.forEach(card => {
        card.setAttribute('data-animate', true);
      });
    }
  }

  showLoadingOverlay() {
    const overlay = this.querySelector('[data-quiz-loading]');
    if (overlay) {
      overlay.classList.add('is-active');
    }
  }

  hideLoadingOverlay() {
    const overlay = this.querySelector('[data-quiz-loading]');
    if (overlay) {
      overlay.classList.remove('is-active');
    }
  }

  resetQuizState() {
    // Reset accumulated handles and current question index
    this.accumulatedHandles = [];
    this.currentQuestionIndex = 0;
    
    // Remove loading state from all buttons
    const buttons = this.querySelectorAll('[data-quiz-button]');
    buttons.forEach(button => {
      button.classList.remove('is-loading');
    });

    // Hide placeholder product cards
    const placeholderContainer = this.querySelector('[data-quiz-product-card-placeholders]');
    if (placeholderContainer) {
      placeholderContainer.classList.add('is-hidden');
    }
  }

  attachQuickAddEvents() {
    const quickAddButtons = this.querySelectorAll('[data-quick-add-button]');
    quickAddButtons.forEach(button => {
      button.addEventListener('click', this.handleQuickAddClick);
    });
  }

  async handleQuickAddClick(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const form = button.closest('form');

    if (!form) return;

    try {
      await this.cartManager.addSingleProduct(form, button, {
        sectionId: this.sectionId
      });

    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  }

  handleButtonClick(event) {
    const button = event.target;
    const productHandles = button.getAttribute('data-product-handles');
    const isLastQuestion = button.hasAttribute('data-last-question');
    
    button.classList.add('is-loading');
    
    if (productHandles) {
      const handles = productHandles.split(',').map(handle => handle.trim()).filter(handle => handle);
      this.accumulatedHandles.push(...handles);
    }
    
    if (isLastQuestion) {
      if (this.accumulatedHandles.length > 0) {
        this.fetchProductData(this.accumulatedHandles.join(','));
      }
    }
    
    // Delay to simulate loading
    setTimeout(() => {
      // Hide current question
      const currentQuestion = this.querySelectorAll('[data-quiz-question]')[this.currentQuestionIndex];
      if (currentQuestion) {
        currentQuestion.classList.add('is-hidden');
      }
      
      if (isLastQuestion) {
        // Show loading overlay immediately after hiding question
        this.showLoadingOverlay();
        
        setTimeout(() => {
          // Hide loading overlay and show results
          this.hideLoadingOverlay();
          
          if (this.accumulatedHandles.length === 0) {
            // Show placeholder product cards
            this.showPlaceholderProductCards();
          } else {
            this.showResults();
            this.resetQuizState();
          }
        }, 1500);
      } else {
        // Show next question
        this.currentQuestionIndex++;
        this.showQuestion(this.currentQuestionIndex);
      }
    }, 800);
  }

  sortHandlesByFrequency(handles) {
    // Count frequency of each handle
    const frequency = {};
    handles.forEach(handle => {
      frequency[handle] = (frequency[handle] || 0) + 1;
    });

    // Get unique handles and sort by frequency (highest first)
    const uniqueHandles = [...new Set(handles)];
    return uniqueHandles.sort((a, b) => frequency[b] - frequency[a]);
  }

  async fetchProductData(productHandles = this.productHandles) {
    const handles = productHandles.split(',').map(handle => handle.trim()).filter(handle => handle);
    const containers = this.querySelectorAll('[data-quiz-product-card]');
    
    // Sort handles by frequency (most frequent first)
    const sortedHandles = this.sortHandlesByFrequency(handles);
    
    // Trim handles to match the number of products to show
    const handlesToRender = sortedHandles.slice(0, this.productsToShow);
    
    let containerIndex = 0;
    
    for (const handle of handlesToRender) {
      if (containerIndex < containers.length) {
        try {
          const url = `/products/${handle}?section_id=quiz-product-card`;
          
          const response = await fetch(url);
          const html = await response.text();
          
          // Inject the HTML into the corresponding container
          containers[containerIndex].innerHTML = html;
          containerIndex++;
          
          this.attachQuickAddEvents();
        } catch (error) {
          console.error(`Error fetching product card for ${handle}:`, error);
        }
      }
    }
  }

  showPlaceholderProductCards() {
    const container = this.querySelector('[data-quiz-product-card-placeholders]');
    if (container) {
      container.classList.remove('is-hidden');
    }
  }

  handleSectionUnload(e) {
    const sectionId = e.detail.sectionId;
    if (this.sectionId != sectionId) return;
    window.eventBus.emit('quiz:modal:hide');
  }

  handleSectionSelect(e) {
    if (this.sectionId != e.detail.sectionId) return;
    this.handleReload();
  }

  handleBlockSelect(e) {
    const { sectionId, blockId } = e.detail;
    if (this.sectionId != sectionId || !blockId) return;
    const block = document.querySelector(`[data-block-id="${blockId}"]`);
    const questionIndex = block?.getAttribute('data-index') - 1 || 0;
    this.handleReload(questionIndex);
  }
  
  handleReload(questionIndex = 0) {
    // Keep track of the current block when the block is selected/loaded
    document.body.setAttribute('data-quiz-block-load', questionIndex);
  
    // Re-init the quiz on block select/reload
    this.resetQuizState();
    this.init();
  }

  disconnectedCallback() {
    const buttons = this.querySelectorAll('[data-quiz-button]');
    buttons.forEach(button => {
      button.removeEventListener('click', this.handleButtonClick);
    });
    
    const quickAddButtons = this.querySelectorAll('[data-quick-add-button]');
    quickAddButtons.forEach(button => {
      button.removeEventListener('click', this.handleQuickAddClick);
    });

    if (window.Shopify.designMode) {
      window.removeEventListener('shopify:section:unload', this.handleSectionUnload);
      window.removeEventListener('shopify:section:select', this.handleSectionSelect);
      window.removeEventListener('shopify:block:select', this.handleBlockSelect);
    }
  }
}

if (!customElements.get('quiz-section')) customElements.define('quiz-section', Quiz);

/******/ })()
;