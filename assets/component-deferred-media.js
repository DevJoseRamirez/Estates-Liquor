/******/ (() => { // webpackBootstrap
/* eslint-disable no-undef */

// =============================== Shared YouTube-API promise ===============================
const getYouTubeAPI = (() => {
  let promise;
  return () => {
    if (promise) return promise;

    promise = new Promise((resolve, reject) => {
      // Already loaded?  Resolve instantly.
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }

      // The global callback that the IFrame API calls when it is READY.
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);

      // Inject the script only once.
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = reject;
      document.head.appendChild(tag);
    });

    return promise;
  };
})();

// =============================== Deferred-media Web Component ===============================
class DeferredMedia extends HTMLElement {
  constructor() {
    super();

    // ===== Cache the DOM elements and set the initial state of the component =====
    this.sectionId = this.getAttribute('data-section-id');
    this.activeMediaClass = this.getAttribute('data-active-media-class');
    this.mediaPlayButton = this.querySelector('[data-media-play-button]');
    this.mediaId = this.getAttribute('data-media-id');
    this.autoPlayEnabled = this.getAttribute('data-auto-play') === 'true';
    this.mediaLayout = this.getAttribute('data-media-layout');
    this.controlsEnabled = this.getAttribute('data-show-controls') === 'true';
    this.mediaCount = this.getAttribute('data-media-count');
    this.isProductMedia = this.getAttribute('data-is-product-media') === 'true';
    this.clickToPlay = this.getAttribute('data-click-to-play') === 'true';
    this.useJsApi = this.getAttribute('data-use-js-api') === 'true';
    this.isBackgroundMedia = this.getAttribute('data-is-background-media') === 'true';
    this.isModalTrigger = this.getAttribute('data-is-modal-trigger') === 'true';

    this.bindEventHandlers();
  }

  connectedCallback() {
    if (this.isModalTrigger) return;

    // ===== Verify the initial setup and register the event listeners =====
    this.verifyInitialSetup();
    this.registerEventListeners();
  }

  disconnectedCallback() {
    this.unregisterEventListeners();
  }

  // ============================= Setup / teardown utilities =============================
  bindEventHandlers() {
    this.handleMediaClick = this.handleMediaClick.bind(this);
    this.handleMediaLoad = this.handleMediaLoad.bind(this);
    this.pauseAllMedia = this.pauseAllMedia.bind(this);
    this.handlePauseMedia = this.handlePauseMedia.bind(this);
    this.handleAutoPlay = this.handleAutoPlay.bind(this);
    this.playMedia = this.playMedia.bind(this);
    this.handleGlobalMediaPlay = this.handleGlobalMediaPlay.bind(this);
    this.handleGlobalMediaPause = this.handleGlobalMediaPause.bind(this);
  }

  verifyInitialSetup() {
    if (!this.mediaPlayButton && !this.isBackgroundMedia) console.error('DeferredMedia: Play button not found!');
    if (!this.mediaId) console.error('DeferredMedia: Media ID not found!');
    if (!this.isProductMedia && this.autoPlayEnabled) this.handleMediaClick();
  }

  registerEventListeners() {
    eventBus.on('load:media', this.handleMediaLoad);
    eventBus.on('pause:media', this.handlePauseMedia);
    eventBus.on('play:media', this.playMedia);
    eventBus.on('slider:media:ready', this.handleAutoPlay);
    eventBus.on('media:play:global', this.handleGlobalMediaPlay);
    eventBus.on('media:pause:all', this.handleGlobalMediaPause);
    this.mediaPlayButton?.addEventListener('click', this.handleMediaClick);
    if (this.clickToPlay) this.addEventListener('click', this.handleMediaClick);
  }

  unregisterEventListeners() {
    this.mediaPlayButton?.removeEventListener('click', this.handleMediaClick);
    if (this.clickToPlay) this.removeEventListener('click', this.handleMediaClick);
    eventBus.off('load:media', this.handleMediaLoad);
    eventBus.off('pause:media', this.handlePauseMedia);
    eventBus.off('play:media', this.playMedia);
    eventBus.off('slider:media:ready', this.handleAutoPlay);
    eventBus.off('media:play:global', this.handleGlobalMediaPlay);
    eventBus.off('media:pause:all', this.handleGlobalMediaPause);
  }

  // ============================= Public event handlers =============================
  handleMediaLoad(event) {
    if (event.mediaId === this.mediaId && event.sectionId === this.sectionId) this.loadMedia();
  }

  handleMediaClick() {
    this.loadMedia();
  }

  hideLoadingIcon() {
    this.loadingIcon?.classList.add('hidden');
  }

  handleAutoPlay(event) {
    if (!event.sectionId || event.sectionId !== this.sectionId) return;
    if (!this.getAttribute('data-media-loaded')) {
      const isVisible = getComputedStyle(this).display !== 'none';
      if (!isVisible && !this.closest('.swiper-slide-active')) return;
      if (this.isProductMedia && !this.closest('.swiper-slide-active')) return;
      this.autoPlayEnabled && this.mediaPlayButton?.click();
    }
  }

  handlePauseMedia() {
    this.pauseAllMedia().then(() => {
      this.removeAutoplayFromLoadedMedia();
    }).catch(console.error);
  }

  playMedia(event) {
    const { sectionId, mediaEl } = event;
    if (mediaEl?.dataset?.mediaIsPlaying === 'true' || this.sectionId !== sectionId || !mediaEl || !this.autoPlayEnabled || !this.getAttribute('data-media-loaded')) return;

    this.pauseAllMedia().then(() => {
      const mediaType = mediaEl.tagName;
      if (mediaType === 'VIDEO') {
        mediaEl.play();
      } else if (mediaType === 'IFRAME') {
        try {
          mediaEl.contentWindow.postMessage(this.messageFn('play', mediaEl.src), '*');
          mediaEl.dataset.mediaIsPlaying = 'true';
        } catch (error) {
          console.error('Error playing iframe media:', error);
        }
      }
    });
  }

  // ============================= Global media management =============================
  handleGlobalMediaPlay(event) {
    const { activeMediaId, activeDeferredMediaElement } = event;
    
    // Don't pause self or if we're a modal trigger or background media
    if (this === activeDeferredMediaElement || this.isModalTrigger || this.isBackgroundMedia) {
      return;
    }
    
    // Pause this deferred media component's video if it's loaded and playing
    if (this.getAttribute('data-media-loaded')) {
      const mediaEl = this.querySelector('video, iframe');
      if (mediaEl) {
        this.pauseSingleMedia(mediaEl);
      }
    }
  }

  handleGlobalMediaPause(event) {
    const { initiator } = event;
    
    // Don't pause self if we're the initiator, or if we're a modal trigger or background media
    if (this === initiator || this.isModalTrigger || this.isBackgroundMedia) {
      return;
    }
    
    // Pause this deferred media component's video if it's loaded and playing
    if (this.getAttribute('data-media-loaded')) {
      const mediaEl = this.querySelector('video, iframe');
      if (mediaEl) {
        this.pauseSingleMedia(mediaEl);
      }
    }
  }

  // Helper method to pause a single media element
  pauseSingleMedia(mediaEl) {
    if (mediaEl.tagName === 'VIDEO' && !mediaEl.paused) {
      mediaEl.pause();
    } else if (mediaEl.tagName === 'IFRAME') {
      try {
        mediaEl.contentWindow.postMessage(this.messageFn('pause', mediaEl.src), '*');
        mediaEl.dataset.mediaIsPlaying = 'false';
      } catch (error) {
        console.error('Error pausing iframe media:', error);
      }
    }
  }

  // ============================= Media loading pipeline =============================
  loadMedia() {
    if (!this.mediaId || this.getAttribute('data-media-loaded')) return;

    this.pauseAllMedia().then(() => {
      const template = this.querySelector('template');
      const mediaElement = template?.content?.querySelector('[data-media-wrapper]');
      if (!mediaElement) return;

      if (this.isProductMedia && this.mediaLayout !== 'grid' && this.mediaCount > 1 && !this.closest('.swiper-slide-active')) return;

      const media = mediaElement.cloneNode(true);
      this.appendChild(media);
      this.setAttribute('data-media-loaded', true);
      media.classList.add(this.activeMediaClass);
      if (this.mediaPlayButton) this.mediaPlayButton.style.display = 'none';
      template.remove();

      const mediaEl = media.querySelector('video, iframe, model-viewer');
      if (mediaEl && mediaEl.tagName === 'VIDEO') {
        this.loadingIcon = this.querySelector('[data-media-loading-icon]');
        if (this.loadingIcon) this.loadingIcon.classList.remove('hidden');
      }

      this.postProcessMedia(mediaEl);
    });
  }

  // =================== JS-API helpers ===================
  loadJsApi() {
    // Vimeo branch: mirror old behaviour but return a promise.
    if (this.querySelector('iframe')?.src?.includes('vimeo')) {
      if (window.Vimeo) return Promise.resolve(window.Vimeo);
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.onload = () => resolve(window.Vimeo);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // YouTube branch: shared promise
    return getYouTubeAPI();
  }

  initializeJsApi(type) {
    if (type === 'youtube') {
      this.loadJsApi().then(YT => {
        const iframe = this.querySelector('iframe');
        if (!iframe) return;

        // Ensure enablejsapi=1 & origin are present exactly once.
        if (!/enablejsapi=1/.test(iframe.src)) {
          const hasQuery = /\?/.test(iframe.src);
          iframe.src += (hasQuery ? '&' : '?') + 'enablejsapi=1&origin=' + encodeURIComponent(location.origin);
        }

        this.player = this.player || new YT.Player(iframe, {
          events: {
            onStateChange: evt => {
              switch (evt.data) {
                case YT.PlayerState.PLAYING:
                  eventBus.emit('video:started', { details: { sectionId: this.sectionId, player: this.player, el: iframe } });
                  eventBus.emit('media:play:global', { activeMediaId: this.mediaId, activeDeferredMediaElement: this });
                  break;
                case YT.PlayerState.ENDED:
                  eventBus.emit('video:ended', { details: { sectionId: this.sectionId, player: this.player, el: iframe } });
                  break;
                case YT.PlayerState.PAUSED:
                  eventBus.emit('video:paused', { details: { sectionId: this.sectionId, player: this.player, el: iframe } });
                  break;
              }
            }
          }
        });
      }).catch(console.error);
    }

    if (type === 'vimeo') {
      this.loadJsApi().then(Vimeo => {
        const iframe = this.querySelector('iframe');
        if (!iframe) return;
        const player = new Vimeo.Player(iframe);
        player.on('play',  () => {
          eventBus.emit('video:started', { details: { sectionId: this.sectionId, player, el: iframe } });
          eventBus.emit('media:play:global', { activeMediaId: this.mediaId, activeDeferredMediaElement: this });
        });
        player.on('ended', () => eventBus.emit('video:ended',   { details: { sectionId: this.sectionId, player, el: iframe } }));
        player.on('pause', () => eventBus.emit('video:paused',  { details: { sectionId: this.sectionId, player, el: iframe } }));
      }).catch(console.error);
    }
  }

  // =================== Post-processing ===================
  postProcessMedia(mediaEl) {
    if (!mediaEl) return;
    mediaEl.style.pointerEvents = 'auto';
    this.loadSpecificMediaFeatures(mediaEl);
  }

  loadSpecificMediaFeatures(mediaEl) {
    switch (mediaEl.tagName) {
      case 'MODEL-VIEWER':
        this.loadModelFeatures(mediaEl);
        break;

      case 'VIDEO':
        mediaEl.play().catch(console.error);
        this.hideLoadingIcon();
        if (!this.controlsEnabled) this.setupVideoToggle(mediaEl);
        mediaEl.addEventListener('ended', () => eventBus.emit('video:ended', { details: { sectionId: this.sectionId, player: mediaEl, el: mediaEl } }));
        mediaEl.addEventListener('play',  () => {
          eventBus.emit('video:started', { details: { sectionId: this.sectionId, player: mediaEl, el: mediaEl } });
          eventBus.emit('media:play:global', { activeMediaId: this.mediaId, activeDeferredMediaElement: this });
        });
        mediaEl.addEventListener('pause', () => eventBus.emit('video:paused',  { details: { sectionId: this.sectionId, player: mediaEl, el: mediaEl } }));
        break;

      case 'IFRAME': {
        const src = mediaEl.src;
        if (src && src.includes('vimeo')) mediaEl.classList.add('pointer-events-none');
        mediaEl.dataset.mediaIsPlaying = 'true';
        if (!this.controlsEnabled) this.setupIframeToggle(mediaEl);

        if (this.useJsApi) {
          const type = src.includes('vimeo') ? 'vimeo' : 'youtube';
          this.initializeJsApi(type);
        }
        break;
      }
    }
  }

  // =================== User-interaction helpers ===================
  setupVideoToggle(videoEl) {
    if (!videoEl || videoEl.tagName !== 'VIDEO') return;
    if (this.isProductMedia && !videoEl.closest('.swiper-slide-active')) return;

    videoEl.addEventListener('click', () => {
      if (videoEl.paused) {
        videoEl.play();
        // The play event will automatically trigger the global media play event
      } else {
        videoEl.pause();
      }
    });
  }

  setupIframeToggle(iframeEl) {
    if (!iframeEl || iframeEl.tagName !== 'IFRAME') return;
    if (this.isProductMedia && !iframeEl.closest('.swiper-slide-active')) return;

    const iframeWrapper = iframeEl.closest('[data-media-wrapper]');
    if (!iframeWrapper) return;

    iframeWrapper.addEventListener('click', () => {
      const src = iframeEl.src;
      const isPlaying = iframeEl.dataset.mediaIsPlaying === 'true';
      if (this.isYouTubeOrVimeo(src)) {
        const message = isPlaying ? 'pause' : 'play';
        try {
          iframeEl.contentWindow.postMessage(this.messageFn(message, src), '*');
          iframeEl.dataset.mediaIsPlaying = isPlaying ? 'false' : 'true';
          // Emit global play event when starting to play
          if (message === 'play') {
            eventBus.emit('media:play:global', { activeMediaId: this.mediaId, activeDeferredMediaElement: this });
          }
        } catch (error) {
          console.error('Error toggling iframe media:', error);
        }
      }
    });
  }

  isYouTubeOrVimeo(src) {
    return /youtube|vimeo/.test(src);
  }

  // =================== 3D model helpers ===================
  loadModelFeatures(modelViewerElement) {
    Shopify.loadFeatures([{
      name: 'model-viewer-ui',
      version: '1.0',
      onLoad: errors => {
        if (errors) return;
        const modelViewerUI = new Shopify.ModelViewerUI(modelViewerElement);
        modelViewerElement.modelViewerUI = modelViewerUI;
        this.addModelInteractionListeners(modelViewerElement);
        this.initializeShopifyXR();
      }
    }]);
  }

  addModelInteractionListeners(modelViewerElement) {
    const events = ['mousedown', 'mouseup', 'touchstart', 'touchend'];
    const actionMap = {
      mousedown: 'disable-swiping',
      mouseup: 'enable-swiping',
      touchstart: 'disable-swiping',
      touchend: 'enable-swiping'
    };

    events.forEach(evt => modelViewerElement.addEventListener(evt, () => eventBus.emit(actionMap[evt], { sectionId: this.sectionId })));
  }

  initializeShopifyXR() {
    Shopify.loadFeatures([{
      name: 'shopify-xr',
      version: '1.0',
      onLoad: errors => {
        if (errors) return;
        document.addEventListener('shopify_xr_initialized', () => this.setupShopifyXR());
      }
    }]);
  }

  setupShopifyXR() {
    document.querySelectorAll('[id^="ProductJSON-"]').forEach(modelJSON => {
      window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
      modelJSON.remove();
    });
    window.ShopifyXR.setupXRElements();
  }

  // =================== Pause / autoplay helpers ===================
  pauseAllMedia() {
    return new Promise((resolve) => {
      // Emit event to pause all media globally
      eventBus.emit('media:pause:all', { initiator: this });
      
      // Resolve immediately as the event-driven system handles the pausing
      // Small delay to allow event handlers to process
      setTimeout(resolve, 10);
    });
  }

  removeAutoplayFromLoadedMedia() {
    const loadedMedia = this.querySelectorAll('[data-media-loaded] iframe, [data-media-loaded] video');
    loadedMedia.forEach(media => this.removeAutoplayFromMedia(media));
  }

  pauseMedia(media) {
    if (media.tagName === 'IFRAME') {
      try {
        media.contentWindow.postMessage(this.messageFn('pause', media.src), '*');
        media.dataset.mediaIsPlaying = 'false';
      } catch (error) {
        console.error('Error pausing iframe media:', error);
      }
    } else if (media.tagName === 'VIDEO' && !media.paused) {
      return media.pause();
    } else if (media.tagName === 'MODEL-VIEWER' && media.modelViewerUI) {
      media.modelViewerUI.pause();
    }
  }

  removeAutoplayFromMedia(media) {
    if (!media || this.autoPlayEnabled) return;
    if (media.tagName === 'IFRAME' && media.src.includes('autoplay=1')) media.src = media.src.replace('autoplay=1', 'autoplay=0');
    if (media.tagName === 'VIDEO' && media.hasAttribute('autoplay')) media.removeAttribute('autoplay');
  }

  messageFn(action, src) {
    if (src.includes('youtube')) return JSON.stringify({ event: 'command', func: action === 'play' ? 'playVideo' : 'pauseVideo', args: [] });
    if (src.includes('vimeo'))   return JSON.stringify({ method: action });
  }
}

if (!customElements.get('deferred-media')) {
  customElements.define('deferred-media', DeferredMedia);
}

/******/ })()
;