/******/ (() => { // webpackBootstrap
class ProductHeroHotspots extends HTMLElement {
  constructor() {
    super();
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleBlockSelect = this.handleBlockSelect.bind(this);
    this.handleBlockDeselect = this.handleBlockDeselect.bind(this);
  }

  connectedCallback() {
    window.wetheme?.webcomponentRegistry?.register({ key: 'component-product-hero' });

    this.sectionId = this.dataset.wethemeSectionId || this.dataset.sectionId;
    this.hotspots = Array.from(this.querySelectorAll('.product-hero__hotspot'));
    this.triggers = Array.from(this.querySelectorAll('[data-hotspot-button]'));

    this.attachEventListeners();
  }

  attachEventListeners() {
    this.triggers.forEach((trigger) => trigger.addEventListener('click', this.handleTriggerClick));
    document.addEventListener('click', this.handleDocumentClick);

    if (window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:block:select', this.handleBlockSelect);
      document.addEventListener('shopify:block:deselect', this.handleBlockDeselect);
    }
  }

  setOpen(hotspot, isOpen) {
    hotspot.classList.toggle('is-open', isOpen);
    const trigger = hotspot.querySelector('[data-hotspot-button]');
    if (trigger) trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  closeAll(except) {
    this.hotspots.forEach((hotspot) => {
      if (hotspot !== except) this.setOpen(hotspot, false);
    });
  }

  // Tap / click reveals the card (desktop hover + keyboard focus are handled in CSS)
  handleTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const hotspot = event.currentTarget.closest('.product-hero__hotspot');
    if (!hotspot) return;

    const willOpen = !hotspot.classList.contains('is-open');
    this.closeAll(hotspot);
    this.setOpen(hotspot, willOpen);
  }

  // Tap away closes any open card
  handleDocumentClick(event) {
    if (event.target.closest && event.target.closest('.product-hero__hotspot')) return;
    this.closeAll();
  }

  // Theme editor: open the card for the selected hotspot block
  handleBlockSelect(event) {
    if (event.detail && event.detail.sectionId !== this.sectionId) return;
    const hotspot = event.target.closest && event.target.closest('.product-hero__hotspot');
    if (hotspot && this.contains(hotspot)) {
      this.closeAll(hotspot);
      this.setOpen(hotspot, true);
    }
  }

  handleBlockDeselect(event) {
    const hotspot = event.target.closest && event.target.closest('.product-hero__hotspot');
    if (hotspot && this.contains(hotspot)) this.setOpen(hotspot, false);
  }

  disconnectedCallback() {
    this.triggers.forEach((trigger) => trigger.removeEventListener('click', this.handleTriggerClick));
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('shopify:block:select', this.handleBlockSelect);
    document.removeEventListener('shopify:block:deselect', this.handleBlockDeselect);
  }
}

if (!customElements.get('product-hero-hotspots')) {
  customElements.define('product-hero-hotspots', ProductHeroHotspots);
}

/******/ })()
;