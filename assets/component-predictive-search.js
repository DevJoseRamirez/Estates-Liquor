/******/ (() => { // webpackBootstrap
class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    // DOM elements
    this.input = this.querySelector('[data-predictive-search-input]');
    this.submitButton = this.querySelector('[data-predictive-search-submit]');
    this.clearButton = this.querySelector('[data-predictive-search-clear]');
    this.resultsContainer = this.querySelector('[data-predictive-search-results]');
    this.emptyStateContainer = this.querySelector('[data-predictive-search-empty-state]');
    this.boxShadowElement = this.closest('.popup-shadow');

    // Initial state
    this.isPredictive = this.getAttribute('is-predictive') === 'true';
    this.searchQuery = this.input.value;
    this.searchChangeTimer = null;
  
    // Bind event handlers
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleClearButtonVisibility = this.handleClearButtonVisibility.bind(this);
    this.handleNavButtonClick = this.handleNavButtonClick.bind(this);
    this.resetState = this.resetState.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-predictive-search'});

    // Add event listeners
    this.input.addEventListener('input', this.handleInputChange);
    this.input.addEventListener('keydown', this.handleInputKeyDown);
    this.submitButton.addEventListener('click', this.handleSubmit);
    this.clearButton.addEventListener('click', this.handleClear);
  }

  handleInputChange() {
    this.handleClearButtonVisibility();

    if (!this.isPredictive) return;

    if (this.input.value !== '') {
      this.searchQuery = this.input.value;

      if (this.searchChangeTimer) {
        window.clearTimeout(this.searchChangeTimer);
      }

      this.searchChangeTimer = window.setTimeout(() => {
        this.performSearch(this.searchQuery);
        this.searchChangeTimer = null;
      }, 250);
    }
    else {
      this.resetState();
    }
  }

  handleClearButtonVisibility() {
    if (this.input.value === '') {
      this.clearButton.classList.add('fade-out');
      setTimeout(() => {
        this.clearButton.classList.add('hide');
        this.clearButton.classList.remove('fade-out');
      }, 250);
    }
    else {
      this.clearButton.classList.remove('hide');
    }
  }

  handleInputKeyDown(event) {
    if (event.key === 'Enter') {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    window.location.href = `${window.Shopify.routes.root}search?q=${encodeURIComponent(this.input.value)}*`;
  }

  handleClear() {
    this.input.value = '';
    this.searchQuery = '';
    this.handleClearButtonVisibility();
    this.input.focus();
    this.resetState();
  }

  async performSearch(query) {
    const url = `${window.Shopify.routes.root}search/suggest?q=${encodeURIComponent(query)}&section_id=predictive-search-results&resources[limit]=10&resources[limit_scope]=each&resources[type]=query,product,collection,page,article`;

    try {
      const response = await fetch(url);
      const responseText = await response.text();

      if (response.status === 417) {
        return;
      }

      if (this.input.value === '') return;

      if (this.emptyStateContainer) {
        this.emptyStateContainer.setAttribute('hidden', '');
      }

      // Render the results
      const doc = new DOMParser().parseFromString(responseText, 'text/html');
      const content = doc.querySelector('.shopify-section');
      if (content) {
        this.renderSearchResults(content.innerHTML);
      }
    } catch (error) {
      console.error(`Failed to fetch search results:`, error);
    }
  }

  renderSearchResults(html) {
    this.resultsContainer.innerHTML = html;

    // Remove any previously tracked event listeners
    if (this.boundNavButtons) {
      this.boundNavButtons.forEach(el => {
        el.removeEventListener('click', this.handleNavButtonClick);
      });
    }

    // Track elements with event listeners for later cleanup
    this.boundNavButtons = [];

    // Add nav button event listeners
    const navButtons = this.resultsContainer.querySelector('[data-predictive-search-nav-buttons]');
    if (navButtons) {
      navButtons.addEventListener('click', this.handleNavButtonClick);
      this.boundNavButtons.push(navButtons);
    }
  }

  handleNavButtonClick(e) {
    e.stopPropagation();
    const navButton = e.target;
    const resultId = navButton.getAttribute('data-nav-id');
    if (!resultId) return;

    const results = this.resultsContainer.querySelector(`[data-grid-id="${resultId}"]`);
    if (!results) return;

    const previousActiveButton = this.resultsContainer.querySelector(`[data-nav-id].active`);
    const previousActiveResult = this.resultsContainer.querySelector(`[data-grid-id]:not([hidden])`);

    // Set active nav button
    if (previousActiveButton) {
      previousActiveButton.setAttribute('aria-selected', 'false');
      previousActiveButton.classList.remove('active');
    }
    navButton.setAttribute('aria-selected', 'true');
    navButton.classList.add('active');

    // Set active results
    const heightContainer = this.resultsContainer.querySelector('[data-predictive-search-main-results]');
    const beforeHeight = heightContainer.clientHeight;

    if (previousActiveResult) {
      previousActiveResult.setAttribute('hidden', '');
    }
  
    results.removeAttribute('hidden');

    // Transition the height change
    heightContainer.animate([
      { height: `${beforeHeight}px` },
      { height: `${heightContainer.clientHeight}px` }
    ], { duration: 500, easing: 'cubic-bezier(0.85, 0, 0.15, 1)' });
  }

  resetState() {
    if (this.searchChangeTimer) {
      window.clearTimeout(this.searchChangeTimer);
    }

    if (this.emptyStateContainer) {
      this.emptyStateContainer.removeAttribute('hidden');
      this.renderSearchResults('');
      return;
    }

    this.resultsContainer.classList.add('fade-out');
    if (this.boxShadowElement) {
      this.boxShadowElement.classList.remove('popup-shadow');
    }

    setTimeout(() => {
      this.renderSearchResults('');
      this.resultsContainer.classList.remove('fade-out');
      if (this.boxShadowElement) {
        this.boxShadowElement.classList.add('popup-shadow');
      }
    }, 300);
  }

  disconnectedCallback() {
    // Remove event listeners
    this.input.removeEventListener('input', this.handleInputChange);
    this.input.removeEventListener('keydown', this.handleInputKeyDown);
    this.submitButton.removeEventListener('click', this.handleSubmit);
    this.clearButton.removeEventListener('click', this.handleClear);

    // Clean up dynamic listeners
    if (this.boundNavButtons) {
      this.boundNavButtons.forEach(el => {
        el.removeEventListener('click', this.handleNavButtonClick);
      });
    }
  }
}

customElements.define('predictive-search', PredictiveSearch);

/******/ })()
;