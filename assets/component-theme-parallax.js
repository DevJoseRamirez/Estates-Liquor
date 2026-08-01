/******/ (() => { // webpackBootstrap
if (!customElements.get('theme-parallax')) {
  class ThemeParallax extends HTMLElement {
    constructor() {
      super();
      this.handleScroll = this.handleScroll.bind(this);
      this.handleIntersection = this.handleIntersection.bind(this);
      this.parallaxEnabled = this.getAttribute('data-parallax-enabled') === 'true';
      this.isVisible = true;
    }

    connectedCallback() {
      if (!this.parallaxEnabled) return;
      // Use the first child (or one with .parallax-child) as the parallax element.
      this.imageElement = this.querySelector('.parallax-child') || this.firstElementChild;
      if (!this.imageElement) {
        console.warn('theme-parallax: no child element found for parallax effect.');
        return;
      }

      // Set up IntersectionObserver to enable/disable scroll/resize events when visible.
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(this.handleIntersection, {
          root: null,
          threshold: 0
        });
        this.observer.observe(this);
      }

      // Always update initially
      this.handleScroll();

      // Re-enable the CSS transition on the next animation frame.
      requestAnimationFrame(() => {
        this.imageElement.getBoundingClientRect(); // Force reflow.
        // Add transition property after the initial transform is applied
        this.imageElement.style.transition = 'transform 0.1s cubic-bezier(.01, .56, 1, 1)';
      });

      if (this.isVisible) {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleScroll);
      }
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('resize', this.handleScroll);
      if (this.observer) {
        this.observer.disconnect();
      }
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          window.addEventListener('scroll', this.handleScroll, { passive: true });
          window.addEventListener('resize', this.handleScroll);
          this.handleScroll();
        } else {
          window.removeEventListener('scroll', this.handleScroll);
          window.removeEventListener('resize', this.handleScroll);
        }
      });
    }

    handleScroll() {
      if (this.rafId) return;
      this.rafId = requestAnimationFrame(() => {
        const containerRect = this.getBoundingClientRect();
        const containerHeight = containerRect.height;
        const childHeight = this.imageElement.offsetHeight;
        const extra = childHeight - containerHeight;

        // Calculate the initial transform (centered image).
        const initialTransform = -extra / 2;
        const containerCenter = containerRect.top + containerHeight / 2;
        const viewportCenter = window.innerHeight / 2;
        const totalDistance = (window.innerHeight + containerHeight) / 2;
        const ratio = (containerCenter - viewportCenter) / totalDistance;
        // Invert the offset so that scrolling down moves the image downward.
        let newTransform = initialTransform - (ratio * (extra / 2));
        newTransform = Math.max(-extra, Math.min(0, newTransform));

        this.imageElement.style.transform = `translate3d(0, ${newTransform}px, 0)`;
        this.rafId = null;
      });
    }
  }

  customElements.define('theme-parallax', ThemeParallax);
}

/******/ })()
;