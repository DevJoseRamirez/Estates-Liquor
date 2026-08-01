/******/ (() => { // webpackBootstrap
class SearchDropdown extends HTMLElement {
  constructor() {
    super();
    this.closeButton = this.querySelector('[data-search-dropdown-close]');
    this.initialFocus = this.querySelector('[data-search-dropdown-initial-focus]');
    this.triggerElement = null;

    this.setHeightVariables = this.setHeightVariables.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.openDropdown = this.openDropdown.bind(this);
    this.closeDropdown = this.closeDropdown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.activateOverlayHeader = this.activateOverlayHeader.bind(this);
    this.deactivateOverlayHeader = this.deactivateOverlayHeader.bind(this);
    this.handleFocusKeyDown = this.handleFocusKeyDown.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-search-dropdown'});

    // Add event listeners
    window.eventBus.on('toggle:search:dropdown', this.toggleDropdown);
    window.eventBus.on('close:search:dropdown', this.closeDropdown);
    this.addEventListener('transitionend', this.handleTransitionEnd);
    this.closeButton.addEventListener('click', this.closeDropdown);

    // Set css variables for header and announcement bar heights for max dropdown height calc
    this.setHeightVariables();
    window.addEventListener('resize', this.setHeightVariables);
  }

  setHeightVariables() {
    const headerHeightDesktop = document.querySelector('.site-header')?.offsetHeight || 0;
    const headerHeightMobile = document.querySelector('.mobile-nav-bar-wrapper')?.offsetHeight || 0;
    this.style.setProperty('--header-height-desktop', `${headerHeightDesktop}px`);
    this.style.setProperty('--header-height-mobile', `${headerHeightMobile}px`);

    const announcementBarHeight = document.querySelector('.announcement_bar')?.offsetHeight || 0;
    this.style.setProperty('--announcement-bar-height', `${announcementBarHeight}px`);
  }

  toggleDropdown(e) {
    e.stopPropagation();
    if (this.getAttribute('aria-hidden') === 'true') {
      this.openDropdown();
    } else {
      this.closeDropdown();
    }
  }

  openDropdown() {
    this.triggerElement = document.activeElement;
    this.setAttribute('aria-hidden', 'false');
    this.classList.add('shown-on-scroll');
    document.body.setAttribute('data-search-dropdown-open', 'true');
    document.body.setAttribute('data-search-dropdown-overlay-visible', 'true');
    this.activateOverlayHeader();
    document.addEventListener('click', this.handleClickOutside);
  }

  closeDropdown() {
    // Restore focus to the triggering element
    if (this.triggerElement) {
      if (document.body.classList.contains('using-keyboard')) {
        this.triggerElement.focus();
      }
      this.triggerElement = null;
    }
    this.setAttribute('aria-hidden', 'true');
    this.classList.remove('shown-on-scroll');
    document.body.removeAttribute('data-search-dropdown-overlay-visible');
    document.removeEventListener('click', this.handleClickOutside);
  }

  trapFocus() {
    if (window.matchMedia('(hover: hover)').matches) {
      this.initialFocus.focus();
    }
    this.addEventListener('keydown', this.handleFocusKeyDown);
  }

  handleFocusKeyDown(e) {
    if (e.key === 'Tab') {
      const focusableElements = Array.from(this.querySelectorAll('button, [href]:not([tabindex="-1"]), input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(element => !element.closest('[hidden]'));
      if (focusableElements.length === 0) return;
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

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
  }

  activateOverlayHeader() {
    const overlayHeaders = document.querySelectorAll('.overlay-header');
    if (overlayHeaders.length > 0) {
      overlayHeaders.forEach(header => {
        header.classList.add('overlay-header--hover');
      });
    }
  }

  deactivateOverlayHeader() {
    const overlayHeaders = document.querySelectorAll('.overlay-header');
    if (overlayHeaders.length > 0) {
      overlayHeaders.forEach(header => {
        header.classList.remove('overlay-header--hover');
      });
    }
  }

  handleTransitionEnd(e) {
    if (e.target !== this) return;

    if (this.getAttribute('aria-hidden') === 'true') {
      this.removeEventListener('keydown', this.handleFocusKeyDown);
      document.body.removeAttribute('data-search-dropdown-open');
      // After drawer has finished closing, remove hover state from overlay headers
      this.deactivateOverlayHeader();
    } else {
      // After drawer has finished opening, trap focus
      this.trapFocus();
    }
  }

  handleClickOutside(e) {
    // If clicking in search or dismissing popup, do nothing
    if (this.contains(e.target) || e.target.id === 'PopupOverlay' || e.target.closest('#popup')) return;
    this.closeDropdown();
  }

  disconnectedCallback() {
    // Remove event listeners
    window.eventBus.off('toggle:search:dropdown', this.toggleDropdown);
    window.eventBus.off('close:search:dropdown', this.closeDropdown);
    this.removeEventListener('transitionend', this.handleTransitionEnd);
    this.closeButton.removeEventListener('click', this.closeDropdown);
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.setHeightVariables);
    this.removeEventListener('keydown', this.handleFocusKeyDown);
    document.body.removeAttribute('data-search-dropdown-open');
    document.body.removeAttribute('data-search-dropdown-overlay-visible');
  }
}

customElements.define('search-dropdown', SearchDropdown);

/******/ })()
;