/******/ (() => { // webpackBootstrap
/* eslint-disable */
if (!customElements.get('store-availability')) {
  customElements.define('store-availability',
  class StoreAvailability extends HTMLElement {
    constructor() {
      super();
      
      this.openDrawer = this.openDrawer.bind(this);
      this.cacheDOMEls();
    }

    cacheDOMEls() {
      this.drawer = this.querySelector('store-availability-drawer');
      this.modalLink = this.querySelector('.store-availability-information__link');
    }

    connectedCallback() {
      this.attachEvents();

      // Move modal html out of product info as that can be sticky, causing z-index problems.
      const parentNode = document.querySelector('#PageContainer');
      const otherAvailabilityDrawers = parentNode.querySelectorAll('store-availability-drawer');

      otherAvailabilityDrawers.forEach(drawer => {
        if (drawer !== this.drawer) {
          drawer.remove();
        }
      });
      
      parentNode.appendChild(this.drawer);
    }

    attachEvents() {
      if (this.modalLink) this.modalLink.addEventListener('click', this.openDrawer);
    }

    openDrawer(e) {
      e.preventDefault();
      window.eventBus.emit('open:availability:drawer');
    }

    disconnectedCallback() {
      if (this.modalLink) this.modalLink.removeEventListener('click', this.openDrawer);
    }
  });
}
/******/ })()
;