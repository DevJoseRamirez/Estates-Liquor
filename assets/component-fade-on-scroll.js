/******/ (() => { // webpackBootstrap
class FadeOnScroll extends HTMLElement {
  constructor() {
    super();
    this.updateOpacityBound = this.updateOpacity.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-fade-on-scroll'});
    this.init();
  }

  init() {

    if (window.Shopify.designMode) {

      // Reset opacity when the section reloads
      document.addEventListener('shopify:section:load', () => {
        this.style.opacity = 1;
      });

      // Intersection observer won't reliably work in the editor, so add the scroll event listener on component load
      this.updateOpacity();
      window.addEventListener('scroll', this.updateOpacityBound);
      return;
    }

    document.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.updateOpacity();
            window.addEventListener('scroll', this.updateOpacityBound);
          } else {
            window.removeEventListener('scroll', this.updateOpacityBound);
          }
        });
      }, {
        root: null,
        threshold: 0
      });
  
      observer.observe(this);
    });
  }

  updateOpacity() {
    const stickyHeader = document.querySelector('[data-header-sticky="true"]');
    const stickyHeaderHeight = stickyHeader ? stickyHeader.getBoundingClientRect().height : 0;
    // Fade should start either when the bottom of the element is 200 pixels down the viewport (excluding sticky header), or the bottom of the element relative to the document  - whichever is higher (fade shouldn't apply when we're at the top of the page)
    const triggerPoint = Math.min((200 + stickyHeaderHeight), this.bottom);
    
    // Determine the range over which opacity will change:
    // Start when the bottom of the element is 200 pixels down the viewport
    // End when the bottom of the element is two thirds between trigger point and the top of the viewport (excluding sticky header)
    const opacityRange = (triggerPoint - stickyHeaderHeight) * 2/3;

    // Calculate how far the bottom of the element is above the trigger point
    const aboveTriggerPoint = triggerPoint - this.getBoundingClientRect().bottom;
    
    // Set the opacity on this basis
    let opacity = 1 - (aboveTriggerPoint / opacityRange);
    opacity = Math.max(0, Math.min(opacity, 1)); // Ensure opacity is always between 0 and 1
    this.style.opacity = opacity;
  }

  get bottom() {
    return this.getBoundingClientRect().bottom + window.scrollY;
  }
}

customElements.define('fade-on-scroll', FadeOnScroll);

/******/ })()
;