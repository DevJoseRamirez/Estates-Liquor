/******/ (() => { // webpackBootstrap
class animatedText extends HTMLElement {
  constructor() {
    super();

    this.dynamicWords = this.querySelectorAll('.text-wrap');
    this.itemIndex = 0;
    this.interval = this.dataset.animationDelay;
    this.classToggler = this.classToggler.bind(this);
  }

  connectedCallback() {
    this.setWidth(this, this.width);
    this.dynamicWords.length > 1 ? this.itemIndex = 1 : this.itemIndex = 0;
    this.init();

    if (window.Shopify.designMode) {
      window.addEventListener('resize', this.classToggler);
    }
  }

  init() {
    setInterval(this.classToggler.bind(this), this.interval);
  }
  
  addClass(elm) {
    elm.classList.add('active');
  }

  removeClass(elm) {
    elm.classList.remove('active');
  }

  get width() {
    return this.dynamicWords[this.itemIndex].offsetWidth + 'px';
  }

  setWidth(elm, width) {
    elm.style.width = width;
  }
  
  classToggler() {
    this.dynamicWords.forEach(el => {
      this.removeClass(el);
    });

    this.setWidth(this, this.width);
    this.addClass(this.dynamicWords[this.itemIndex]);

    if (this.dynamicWords.length > 1) {
      if (this.itemIndex < this.dynamicWords.length - 1) {
        this.itemIndex++;
      } else {
        this.itemIndex = 0;
      }
    } else {
      this.itemIndex = 0;
    }
  }

  disconnectedCallback() {
    if (window.Shopify.designMode) {
      window.removeEventListener('resize', this.classToggler);
    }
  }
}

customElements.define('animated-text', animatedText);

/******/ })()
;