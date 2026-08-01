/******/ (() => { // webpackBootstrap
if (!customElements.get('file-upload')) {
  class FileUpload extends HTMLElement {
    constructor() {
      super();
      
      this.cacheDOMElements();
      this.bindMethods();
    }

    cacheDOMElements() {
      this.fileInput = this.querySelector('[data-file-input]');
      this.dragDrop = this.querySelector('[data-drag-drop]');
      this.fileListItem = this.querySelector('[data-file-list-item]');
      this.inputError = this.querySelector('[data-input-error]');
      this.removeFileButton = this.querySelector('[data-file-list-content]');
      this.wethemeGlobal = document.querySelector('script#wetheme-global');
      this.translationsObject = JSON.parse(this.wethemeGlobal.textContent);
    }

    bindMethods() {
      this.handleFileInputClick = this.handleFileInputClick.bind(this);
      this.handleDrop = this.handleDrop.bind(this);
      this.handleFileInput = this.handleFileInput.bind(this);
      this.handleFile = this.handleFile.bind(this);
      this.resetFileInput = this.resetFileInput.bind(this);
      this.clearFileInput = this.clearFileInput.bind(this);
      this.clearAll = this.clearAll.bind(this);
      this.preventDefaults = this.preventDefaults.bind(this);
    }

    attachEventListeners() {
      this.dragDrop.addEventListener('click', this.handleFileInputClick);
      this.dragDrop.addEventListener('drop', this.handleDrop);
      this.dragDrop.addEventListener('dragenter', this.preventDefaults);
      this.dragDrop.addEventListener('dragover', this.preventDefaults);
      this.dragDrop.addEventListener('dragleave', this.preventDefaults);
      this.fileInput.addEventListener('change', this.handleFileInput);
      this.removeFileButton.addEventListener('click', this.clearAll);
      window.eventBus.on('cart:added', this.clearAll);
    }

    removeEventListeners() {
      this.dragDrop.removeEventListener('click', this.handleFileInputClick);
      this.dragDrop.removeEventListener('drop', this.handleDrop);
      this.dragDrop.removeEventListener('dragenter', this.preventDefaults);
      this.dragDrop.removeEventListener('dragover', this.preventDefaults);
      this.dragDrop.removeEventListener('dragleave', this.preventDefaults);
      this.fileInput.removeEventListener('change', this.handleFileInput);
      this.removeFileButton.removeEventListener('click', this.clearAll);
      window.eventBus.off('cart:added', this.clearAll);
    }

    connectedCallback() {
      if (!this.fileInput || !this.dragDrop || !this.fileListItem || !this.inputError) return;
      this.attachEventListeners();
    }

    handleFileInputClick() {
      this.fileInput.click(); // Trigger the file input click event
    }

    handleDrop(event) {
      this.preventDefaults(event);
      const file = event.dataTransfer.files[0];
      this.fileInput.files = event.dataTransfer.files; // Manually set the file input files
      this.handleFile(file);
    }

    handleFileInput(event) {
      const file = event.target.files[0];
      this.handleFile(file);
    }

    resetFileInput() {
      this.classList.remove('has-file'); // Reset the file upload state
      this.fileListItem.textContent = ''; // Clear the file list
      if (this.inputError.textContent) this.inputError.textContent = ''; // Clear any previous errors
      
      this.requiredFieldError = this.querySelector('.required-field-error');
      if (this.requiredFieldError) this.requiredFieldError.remove(); // Clear the required field error

      this.requiredFieldSubmitError = document.querySelector('product-form .required-field-error'); // Check if the required field error is in the product form
      if (this.requiredFieldSubmitError) this.requiredFieldSubmitError.remove(); // Clear the required field error
    }

    clearFileInput() {
      this.fileInput.value = '';
    }

    clearAll() {
      this.resetFileInput();
      this.clearFileInput();
    }

    handleFile(file) {
      if (!file) return;
      this.resetFileInput(); // Reset the file input
      const maxSize = 20 * 1024 * 1024; // 20MB limit

      if (file.size > maxSize) {
        // Display an error message if the file is too large
        this.inputError.textContent = this.translationsObject.translations.max_filesize_error;
        this.clearFileInput();
        this.fileInput.focus(); // Focus the file input
      } else {
        // Display the file name and add it to the file list
        this.classList.add('has-file');
        this.fileListItem.textContent = file.name;
        this.fileInput.focus(); // Focus the file input
      }
    }

    preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }
  customElements.define('file-upload', FileUpload);
}

/******/ })()
;