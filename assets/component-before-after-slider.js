/******/ (() => { // webpackBootstrap
class BeforeAfterSlider extends HTMLElement {
  constructor() {
    super();
    this.container = this.querySelector('.before-after-slider__container');
    this.afterImage = this.querySelector('.before-after-slider__image--after');
    this.divider = this.querySelector('.before-after-slider__divider');
    this.handle = this.querySelector('.before-after-slider__handle');
    this.sectionId = this.dataset.sectionId;

    this.init = this.init.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.isDragging = false;
    
    // Touch tracking for intelligent scroll prevention
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchMoved = false;
    this.isHorizontalDrag = false;
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-before-after-slider'});
    this.init();
  }

  init() {
    if (this.container && this.afterImage && this.divider && this.handle) {
      // Mouse events
      this.handle.addEventListener('mousedown', this.handleStart);
      this.container.addEventListener('mousedown', this.handleStart);
      
      // Touch events - start with passive: true to allow scrolling
      this.handle.addEventListener('touchstart', this.handleStart, { passive: true });
      this.container.addEventListener('touchstart', this.handleStart, { passive: true });
      
      // Keyboard events for accessibility
      this.handle.addEventListener('keydown', this.handleKeydown);
      
      if (window.Shopify && window.Shopify.designMode) {
        document.addEventListener('shopify:section:load', (event) => {
          if (this.sectionId && event.detail.sectionId === this.sectionId) {
            // Remove show-on-scroll and add shown-on-scroll to trigger animation
            this.container.classList.remove('show-on-scroll');
            this.container.classList.add('shown-on-scroll', 'animated', 'fadeIn');
          }
        });
      }
    }
  }

  handleStart(e) {
    // For mouse events, prevent default and start dragging immediately
    if (e.type === 'mousedown') {
      e.preventDefault();
      this.isDragging = true;
      this.isHorizontalDrag = true;
      
      // Add mouse move/end listeners
      document.addEventListener('mousemove', this.handleMove);
      document.addEventListener('mouseup', this.handleEnd);
      
      this.updateSlider(e);
      return;
    }
    
    // For touch events
    if (e.touches && e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchMoved = false;
      
      // If touching the handle directly, start dragging immediately
      if (e.target.closest('.before-after-slider__handle')) {
        this.isHorizontalDrag = true;
        this.isDragging = true;
      } else {
        // For container touches, use intelligent detection
        this.isHorizontalDrag = false;
      }
      
      // Add touch move/end listeners with passive: false to allow preventDefault later
      document.addEventListener('touchmove', this.handleMove, { passive: false });
      document.addEventListener('touchend', this.handleEnd);
      
      // If we're already dragging (handle touch), update immediately
      if (this.isDragging) {
        this.updateSlider(e);
      }
    }
  }

  handleMove(e) {
    // Handle mouse movement
    if (e.type === 'mousemove' && this.isDragging) {
      this.updateSlider(e);
      return;
    }
    
    // Handle touch movement with intelligent direction detection
    if (e.type === 'touchmove' && e.touches && e.touches.length > 0) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      if (!this.touchMoved) {
        // First move - determine direction
        const deltaX = Math.abs(currentX - this.touchStartX);
        const deltaY = Math.abs(currentY - this.touchStartY);
        
        // Only consider it moved if there's any significant movement (threshold of 5px)
        if (deltaX > 5 || deltaY > 5) {
          this.touchMoved = true;
          
          // Determine if this is primarily horizontal movement with lower threshold
          if (deltaX > deltaY && deltaX > 8) {
            this.isHorizontalDrag = true;
            this.isDragging = true;
          }
        }
      }
      
      // If we've determined this is a horizontal drag, prevent default and update slider
      if (this.isHorizontalDrag && this.isDragging) {
        e.preventDefault(); // Prevent scrolling only for horizontal drags
        this.updateSlider(e);
      }
      // Otherwise, allow normal scrolling behavior
    }
  }

  handleEnd() {
    this.isDragging = false;
    
    // Reset touch tracking variables
    this.touchMoved = false;
    this.isHorizontalDrag = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    
    // Remove all event listeners
    document.removeEventListener('mousemove', this.handleMove);
    document.removeEventListener('mouseup', this.handleEnd);
    document.removeEventListener('touchmove', this.handleMove);
    document.removeEventListener('touchend', this.handleEnd);
  }

  handleKeydown(e) {
    // Only handle arrow keys
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return;
    }
    
    // Prevent default behavior to avoid page scrolling
    e.preventDefault();
    
    // Get current position from CSS custom property or default to 50%
    const currentPosition = parseFloat(
      getComputedStyle(this.container).getPropertyValue('--divider-position') || '50'
    );
    
    // Define increment size (2% per keypress)
    const increment = 2;
    let newPosition;
    
    if (e.key === 'ArrowLeft') {
      newPosition = Math.max(0, currentPosition - increment);
    } else if (e.key === 'ArrowRight') {
      newPosition = Math.min(100, currentPosition + increment);
    }
    
    // Update the slider position
    this.setSliderPosition(newPosition);
  }

  updateSlider(e) {
    const rect = this.container.getBoundingClientRect();
    
    // Get x coordinate from either mouse or touch event
    let x;
    if (e.touches && e.touches.length > 0) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      // Touch end event
      x = e.changedTouches[0].clientX - rect.left;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
    }
    
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    this.setSliderPosition(percentage);
  }

  setSliderPosition(percentage) {
    // Update the CSS custom property
    this.container.style.setProperty('--divider-position', `${percentage}%`);
    
    // Update ARIA attribute for accessibility
    const handleElement = this.handle.querySelector('[role="slider"]');
    if (handleElement) {
      handleElement.setAttribute('aria-valuenow', Math.round(percentage));
    }
  }

  disconnectedCallback() {
    if (this.handle) {
      this.handle.removeEventListener('mousedown', this.handleStart);
      this.handle.removeEventListener('touchstart', this.handleStart, { passive: true });
      this.handle.removeEventListener('keydown', this.handleKeydown);
    }
    if (this.container) {
      this.container.removeEventListener('mousedown', this.handleStart);
      this.container.removeEventListener('touchstart', this.handleStart, { passive: true });
    }
    
    // Remove document event listeners
    document.removeEventListener('mousemove', this.handleMove);
    document.removeEventListener('mouseup', this.handleEnd);
    document.removeEventListener('touchmove', this.handleMove);
    document.removeEventListener('touchend', this.handleEnd);
  }
}

if (!customElements.get('before-after-slider')) customElements.define('before-after-slider', BeforeAfterSlider);
/******/ })()
;