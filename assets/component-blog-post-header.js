/******/ (() => { // webpackBootstrap
class BlogPostHeader extends HTMLElement {
  constructor() {
    super();
    this.hasHeaderImage = this.getAttribute('data-has-header-image') === 'true';
    this.overlayHeaders = document.querySelectorAll('.overlay-header');
    this.handleOverlayHeader = this.handleOverlayHeader.bind(this);
  }

  connectedCallback() {
    window.wetheme.webcomponentRegistry.register({key: 'component-blog-post-header'});
    this.handleOverlayHeader();
  }

  handleOverlayHeader() {
    if (this.overlayHeaders.length > 0) {
      this.overlayHeaders.forEach(header => {
        header.classList.toggle('overlay-header--disable', !this.hasHeaderImage);
      });
    }
  }
}

customElements.define('blog-post-header', BlogPostHeader);

/******/ })()
;