/******/ (() => { // webpackBootstrap
/* eslint-disable no-undef */
class SocialProofReviews extends HTMLElement {
  constructor() {
    super();

    // =============================== State & configuration ===============================
    this.bannerWrapper            = null;
    this.originalBanner           = null;
    this.currentDuplicationFactor = 0;
    this.sectionId                = this.getAttribute('data-section-id');
    this.breakpoint               = 768; // $md-min
    this.isDesktop                = window.innerWidth >= this.breakpoint;
    this.previousWidth            = window.innerWidth;

    // =============================== Bind once so we can remove later ===============================
    this.modalOpenHandler    = this.handleModalOpen.bind(this);
    this.modalCloseHandler   = this.handleModalClose.bind(this);
    this.resizeHandler       = this.handleResize.bind(this);
    this.handleSectionLoad   = this.handleSectionLoad.bind(this);

    this.blockSelectHandler   = this.handleBlockSelect.bind(this);
    this.blockDeselectHandler = this.handleBlockDeselect.bind(this);
    this.unmuteVideo          = this.unmuteVideo.bind(this);
    this.addEventListeners();
  }

  // =============================== Lifecycle ===============================
  connectedCallback() {
    this.bannerWrapper      = this.querySelector('.vertical-banner-wrapper');
    this.originalBanner     = this.querySelector('.vertical-banner');
    this.socialProofSection = document.querySelector('.social-proof-section');

    if (!this.bannerWrapper || !this.originalBanner) {
      console.error('SocialProofReviews: required elements not found');
      return;
    }

    this.setupScrollingContent();
    this.updateSectionHeight();
  }

  disconnectedCallback() {
    eventBus.off('theme:modal:open',  this.modalOpenHandler);
    eventBus.off('theme:modal:close', this.modalCloseHandler);
    eventBus.off('video:started', this.unmuteVideo);
    window.removeEventListener('resize', this.resizeHandler);

    if (window.Shopify?.designMode) {
      document.removeEventListener('shopify:section:load', this.handleSectionLoad);
      document.removeEventListener('shopify:block:select',   this.blockSelectHandler,   true);
      document.removeEventListener('shopify:block:deselect', this.blockDeselectHandler, true);
    }
  }

  // =============================== Event listeners ===============================
  addEventListeners() {
    eventBus.on('theme:modal:open',  this.modalOpenHandler);
    eventBus.on('theme:modal:close', this.modalCloseHandler);
    eventBus.on('video:started', this.unmuteVideo);
    window.addEventListener('resize', this.resizeHandler);

    if (window.Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.handleSectionLoad);
      document.addEventListener('shopify:block:select',   this.blockSelectHandler,   true);
      document.addEventListener('shopify:block:deselect', this.blockDeselectHandler, true);
    }
  }

  // =============================== Section & block events ===============================
  handleSectionLoad(event) {
    if (event.detail.sectionId !== this.sectionId) return;
    this.setupScrollingContent();
    this.updateSectionHeight();
  }

  handleBlockSelect(event) {
    if (event.detail.sectionId !== this.sectionId) return;

    // Prevent Shopify page scroll
    event.stopImmediatePropagation();
    event.preventDefault();

    // Convert current translateY to scrollTop & pause animation
    this.pauseAndConvertTransform();

    const blockId = event.detail.blockId;
    if (!blockId) return;

    // Find the *nearest* visible copy of the block
    const candidates = Array.from(
      this.bannerWrapper.querySelectorAll(`[data-block-id="${blockId}"]`),
    );
    if (!candidates.length) return;

    const wrapperRect = this.bannerWrapper.getBoundingClientRect();
    let targetEl = candidates[0];
    let minDist  = Math.abs(targetEl.getBoundingClientRect().top - wrapperRect.top);

    for (const el of candidates) {
      const d = Math.abs(el.getBoundingClientRect().top - wrapperRect.top);
      if (d < minDist) {
        minDist  = d;
        targetEl = el;
      }
    }

    targetEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  handleBlockDeselect(event) {
    if (event.detail.sectionId !== this.sectionId) return;
    this.resumeMarquee();
  }

  // =============================== Modal open/close ===============================
  handleModalOpen(event) {
    if (event.details.sectionId === this.sectionId) {
      this.bannerWrapper.classList.add('video-active');
    }
  }

  handleModalClose(event) {
    if (event.details.sectionId === this.sectionId) {
      this.bannerWrapper.classList.remove('video-active');
    }
  }

  // =============================== Resize ===============================
  handleResize() {
    const w                  = window.innerWidth;
    const crossedBreakpoint  = (w >= this.breakpoint) !== this.isDesktop;
    this.isDesktop           = w >= this.breakpoint;

    if (crossedBreakpoint) {
      this.previousWidth = w;
      this.updateSectionHeight();
      this.setupScrollingContent();
    } else if (Math.abs(w - this.previousWidth) > 100) {
      this.previousWidth = w;
      if (this.isDesktop) this.updateSectionHeight();
    }
  }

  // =============================== Animation control helpers ===============================
  // Freeze keyframes, convert translateY to scrollTop, clear transform.
  pauseAndConvertTransform() {
    if (!this.bannerWrapper) return;

    // Extract current translateY from computed matrix
    const matrix = getComputedStyle(this.bannerWrapper).transform;
    let y = 0;
    if (matrix && matrix.startsWith('matrix')) {
      const values = matrix.match(/matrix\(([^)]+)\)/)[1].split(',');
      y = parseFloat(values[5] || 0); // m42 = 6th value
    }

    // Pause keyframes
    this.bannerWrapper.style.animation = 'none';

    // Clear transform and mimic position with scrollTop
    this.bannerWrapper.style.transform  = 'none';
    this.bannerWrapper.scrollTop        = -y;

    // Enable internal scrolling
    this.bannerWrapper.style.overflowY = 'auto';
  }

  // Reset scroll/overflow and restart keyframes from the top.
  resumeMarquee() {
    if (!this.bannerWrapper) return;

    // Reset scrolling settings
    this.bannerWrapper.style.overflowY = '';
    this.bannerWrapper.scrollTop       = 0;
    
    // Force a reflow to ensure animation restarts
    void this.bannerWrapper.offsetWidth;
    
    // Reset animation and transform
    this.bannerWrapper.style.animation = '';
    this.bannerWrapper.style.transform = '';
    
    // Explicitly restart animation with the CSS properties
    const duration = Math.max(5, parseFloat(this.bannerWrapper.style.getPropertyValue('--scroll-height')) / 50);
    this.bannerWrapper.style.animation = `continuousScroll ${duration}s linear infinite`;
  }

  // =============================== Layout helpers ===============================
  updateSectionHeight() {
    if (!this.socialProofSection) {
      this.socialProofSection = document.querySelector('.social-proof-section');
      if (!this.socialProofSection) return;
    }

    if (this.isDesktop) {
      const content = document.querySelector('.social-proof-content');
      if (content) this.socialProofSection.style.height = `${content.offsetHeight}px`;
    } else {
      this.socialProofSection.style.height = '80vh';
    }
  }

  // =============================== Cloning & marquee setup ===============================
  setupScrollingContent() {
    if (!this.originalBanner || !this.originalBanner.children.length) return;

    const contentH        = this.originalBanner.offsetHeight;
    const containerH      = this.clientHeight;
    const gap             = parseFloat(getComputedStyle(this.bannerWrapper).getPropertyValue('gap')) || 0;
    const scrollHeight    = contentH + gap;
    if (scrollHeight <= gap || containerH <= 0) return;

    const factor          = Math.max(2, Math.ceil((containerH * 1.5) / scrollHeight) + 1);
    if (factor !== this.currentDuplicationFactor) {
      this.currentDuplicationFactor = factor;
      this.bannerWrapper.querySelectorAll('.cloned-banner').forEach((c) => c.remove());
      for (let i = 1; i < factor; i++) {
        const clone = this.originalBanner.cloneNode(true);
        clone.classList.add('cloned-banner');
        clone.setAttribute('aria-hidden', 'true');
        this.bannerWrapper.appendChild(clone);
      }
      this.bannerWrapper.style.setProperty('--scroll-height', `${scrollHeight}px`);
      const duration = Math.max(5, scrollHeight / 50);
      this.bannerWrapper.style.animationDuration = `${duration}s`;
    }
  }

  unmuteVideo(event) {
    if (event.details.sectionId !== this.sectionId || window.Shopify?.designMode) return;
    const el = event.details.el;
    const modal = el.closest('[data-modal-body][data-muted]');
    const muted = modal?.dataset.muted === 'true';
    const player = event.details.player;
    
    if (!el || muted) return;
    
    // Unmute the video
    if (el.tagName === 'VIDEO') {
      el.muted = false;
    } else if (el.tagName === 'IFRAME') {
      if (el.src.includes('youtube')) {
        player.unMute();
      } else if (el.src.includes('vimeo')) {
        player.setVolume(1);
      }
    }
  }
}

if (!customElements.get('social-proof-reviews')) {
  customElements.define('social-proof-reviews', SocialProofReviews);
}

/******/ })()
;