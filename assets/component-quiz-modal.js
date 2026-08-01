/******/ (() => { // webpackBootstrap
if (!customElements.get('quiz-modal')) {
  const Z_INDEX = {
    MODAL_ABOVE_DRAWER: '1400',
    MODAL_DEFAULT: '1500'
  };
  
  class QuizModal extends HTMLElement {
    constructor() {
      super();
      this.modalId = 'QuizModal';
      this.modalContentSelector = '[data-modal-content] .theme-modal--inner';
      this.focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
      this.restoreFocusOnClose = this.getAttribute('data-focus-on-close');
      this.cacheDOMElements();
      this.bindEventHandlers();
    }

    cacheDOMElements() {
      this.sectionId = this.getAttribute('data-section-id');
      this.sectionFetchId = this.getAttribute('data-section-fetch-id');
      this.productUrl = this.getAttribute('data-product-url');
      this.contentSelector = this.getAttribute('data-content-selector');
      this.modalButton = this.querySelector('[data-modal-button]');
      this.modalTemplate = this.querySelector('template[data-quiz-modal-content]');
      this.overlay = document.querySelector('#QuizOverlay');
      this.modalContent = this.querySelector('[data-modal-content]');
      this.startButton = this.querySelector('[data-modal-button]');

      // Early return if required elements are missing
      if (!this.modalButton || !this.modalTemplate) {
        console.warn('Quiz Modal: Required elements missing');
        return;
      }
    }

    bindEventHandlers() {
      this.showModal = this.showModal.bind(this);
      this.hideModal = this.hideModal.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.setColors = this.setColors.bind(this);
      this.removeColors = this.removeColors.bind(this);
    }

    connectedCallback() {
      // Listen for generic modal hide event
      window.eventBus.on('quiz:modal:hide', this.hideModal);

      // Show modal when button is clicked
      this.modalButton.addEventListener('click', this.showModal);

      this.overlay.addEventListener('click', this.hideModal);

      // Handle editor events
      if (window.Shopify.designMode) {
        // Force the modal to open if a block has reloaded
        setTimeout(() => {
          this.handleLoad();
        });

        // Hide the modal on section load if it's already open
        document.addEventListener('shopify:section:load', async () => {
          this.hideModal();
        });
      }
    }

    handleLoad() {
      const questionIndex = document.body.getAttribute('data-quiz-block-load');
      if (!questionIndex || !this.startButton) return;

      // If quiz is in progress during a block reload, start the quiz
      this.startButton.click();
    }

    disconnectedCallback() {
      // Clean up event listeners
      this.modalButton.removeEventListener('click', this.showModal);
      if (this.overlay) this.overlay.removeEventListener('click', this.hideModal);
      if (this.dismissButton) this.dismissButton.removeEventListener('click', this.hideModal);

      window.eventBus.off('quiz:modal:hide', this.hideModal);

      if (window.Shopify.designMode) {
        document.body.removeAttribute('data-quiz-block-load');
      }
    } 

    initScrollHandler(el) {
      if (!el) return;
      let scrolling;

      el.addEventListener('scroll', () => {
        clearTimeout(scrolling);
        el.classList.add('scrolling');
        scrolling = setTimeout(() => {
          el.classList.remove('scrolling');
        }, 800);
      });
    }

    async render() {
      try {
        const modalContent = document.querySelector(`#${this.modalId}`);
        if (!modalContent) {
          console.warn('Quiz Modal: Modal content element not found');
          return false;
        }
    
        // Insert your template
        modalContent.innerHTML = this.modalTemplate.innerHTML;
        this.modalContent = modalContent;
        this.dismissButton = this.modalContent.querySelector('[data-close]');
    
        // Set up the dismiss button, etc.
        if (this.dismissButton) {
          this.dismissButton.addEventListener('click', this.hideModal);
        }
    
        return true;
      } catch (error) {
        console.error('Quiz Modal: Error rendering modal', error);
        return false;
      }
    }    

    async showModal(e) {
      e.stopPropagation();
      e.preventDefault();
    
      // Store the element that was focused before opening the modal
      this.previousActiveElement = e.currentTarget;
    
      const rendered = await this.render();
      if (rendered) {
        document.body.classList.add('quiz-modal-open');
        if (this.modalContent) {
          this.modalContent.classList.remove('hidden');
          
          // Apply color overrides if present
          this.setColors();
          
          this.trapFocus();
    
          const scrollableInner = this.modalContent.querySelector('[data-modal-content]');
          if (scrollableInner) {
            this.initScrollHandler(scrollableInner);
          }
        }
      }
    }    

    hideModal() {
      const modalIsOpen = document.body.classList.contains('quiz-modal-open');
      // Remove the open class to trigger the CSS fade-out/transform transition
      document.body.classList.remove('quiz-modal-open');
    
      // Remove keydown listener
      document.removeEventListener('keydown', this.handleKeydown);
    
      // Clean up event listeners for overlay and dismiss button
      // if (this.overlay) this.overlay.removeEventListener('click', this.hideModal);
      if (this.dismissButton) this.dismissButton.removeEventListener('click', this.hideModal);
    
      // Delay clearing modal content until after the CSS transition finishes
      if (this.modalContent) {
        const timeoutId = setTimeout(() => {
          if (!document.body.classList.contains('quiz-modal-open')) {
            this.modalContent.innerHTML = '';
          }
        }, 1000); // Fallback after 1s

        if (modalIsOpen) {
          this.modalContent.addEventListener('transitionend', () => {
            if (document.body.classList.contains('quiz-modal-open')) return;

            clearTimeout(timeoutId);
            
            // Remove color overrides
            this.removeColors();
            
            // Clear the modal content
            this.modalContent.innerHTML = '';
          }, { once: true });
        }
      }
    
      // Return focus to the previously active element
      if (this.restoreFocusOnClose === 'true' &&
          this.previousActiveElement &&
          typeof this.previousActiveElement.focus === 'function') {
        this.previousActiveElement.focus();
      }
    }

    setColors() {
      const backgroundColorOverride = this.getAttribute('data-background-color-override');
      const modalContentElement = this.modalContent?.querySelector('[data-modal-content]');
      backgroundColorOverride && modalContentElement && (modalContentElement.style.backgroundColor = backgroundColorOverride);

      const textColorOverride = this.getAttribute('data-text-color-override');
      textColorOverride && modalContentElement && (modalContentElement.style.color = textColorOverride);
    }

    removeColors() {
      const modalContentElement = this.modalContent?.querySelector('[data-modal-content]');
      if (modalContentElement) {
        modalContentElement.style.color = '';
        modalContentElement.style.backgroundColor = '';
      }
    }

    trapFocus() {
      const focusableElements = this.modalContent.querySelectorAll(this.focusableSelector);
      const firstElement = focusableElements[0];
      
      if (!firstElement) return;

      document.addEventListener('keydown', this.handleKeydown);
      requestAnimationFrame(() => firstElement.focus());
    }

    handleKeydown(event) {
      const focusableElements = this.modalContent.querySelectorAll(this.focusableSelector);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (!firstElement || !lastElement) return;

      const isTabPressed = event.key === 'Tab';
      const isEscapePressed = event.key === 'Escape';

      if (isEscapePressed) {
        this.hideModal();
        return;
      }

      if (!isTabPressed) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  customElements.define('quiz-modal', QuizModal);
}

/******/ })()
;