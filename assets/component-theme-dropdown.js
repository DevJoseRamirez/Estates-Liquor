/******/ (() => { // webpackBootstrap
if (!customElements.get('theme-dropdown')) {
  class ThemeDropdown extends HTMLElement {

    connectedCallback() {
      /* ===== Cache the DOM elements and attach the event listeners ===== */
      this.cacheDOMElements();
      this.attachEventListeners();
    }

    cacheDOMElements() {
      this.dropdownTrigger = this.querySelector('[data-dropdown-trigger]');
      this.dropdownOptions = this.querySelector('[data-dropdown-options]');
      this.selectedOptionText = this.querySelector('[data-dropdown-text]');
      this.dropdownInput = this.querySelector('[data-dropdown-input]');
      this.options = this.dropdownOptions.querySelectorAll('li');
      if (!this.dropdownTrigger || !this.dropdownOptions || !this.selectedOptionText || !this.dropdownInput) return;
    }

    attachEventListeners() {
      this.dropdownTrigger.addEventListener('click', this.toggleDropdown.bind(this));
      document.addEventListener('click', this.onDocumentClick.bind(this));
      this.options.forEach(option => {
        option.addEventListener('click', this.handleOptionClick.bind(this, option));
        option.addEventListener('keydown', this.handleOptionKeyDown.bind(this));
      });
      this.dropdownOptions.addEventListener('focusout', this.closeDropdownOnFocusOut.bind(this));
    }

    toggleDropdown() {
      /* ===== Toggle the dropdown open and closed ===== */
      const isOpen = this.dropdownOptions.style.display === 'flex';
      this.updateButtonStates();
      
      if (isOpen) {
        this.dropdownTrigger.focus();
        this.updateDropdownClasses(isOpen);
        this.closeDropdown(); 
      } else {
        this.dropdownOptions.querySelector('li').focus();
        this.dropdownOptions.style.display = 'flex';
        setTimeout(() => this.updateDropdownClasses(isOpen), 50); // Toggle the open state classes with a short delay to allow the dropdown to animate
      }
    }

    updateDropdownClasses(isOpen) {
      /* ===== Update the dropdown classes to open or close the dropdown ===== */
      const action = isOpen ? 'remove' : 'add';
      this.classList[action]('theme-dropdown--open');
      this.dropdownOptions.classList[action]('theme-dropdown-fade-enter-active', 'theme-dropdown-fade-enter-to', 'theme-dropdown-fade-enter');
      this.dropdownOptions.classList[action === 'add' ? 'remove' : 'add']('theme-dropdown-fade-leave-active', 'theme-dropdown-fade-leave-to', 'theme-dropdown-fade-enter');
    }

    closeDropdown() {
      /* ===== Close the dropdown by hiding the dropdown list ===== */
      setTimeout(() => {this.dropdownOptions.style.display = 'none'}, 150);
    }

    updateButtonStates() {
      /* ===== Update the button states based on the dropdown open or closed state ===== */
      const isOpen = this.dropdownOptions.style.display === 'flex';
      const ariaExpanded = isOpen ? 'false' : 'true';
      this.dropdownTrigger.setAttribute('aria-expanded', ariaExpanded);
    }

    onDocumentClick(event) {
      /* ===== Close the dropdown when the user clicks outside of the dropdown ===== */
      if (!this.contains(event.target)) {
        this.updateButtonStates();
        this.updateDropdownClasses(true);
        this.closeDropdown();
      }
    }

    handleOptionClick(option) {
      /* ===== Handle the click event on the dropdown options ===== */
      this.updateOptionLabel(this.selectedOptionText, option); // Update the display area with this option's text
      this.markOptionAsSelected(option); // Update the 'selected' state 
      this.toggleDropdown(); // Close the dropdown
      this.updateOptionInputValue(option); // Update the hidden input value
    }

    updateOptionLabel(currentLabelElement, newLabelElement) {
      /* ===== Update the display area with the new option's text ===== */
      const newLabel = newLabelElement.textContent;
      currentLabelElement.textContent = newLabel;
    }

    markOptionAsSelected(option) {
      /* ===== Mark the selected option as 'selected' and remove the 'selected' state from all other options ===== */
      this.options.forEach(opt => {
        opt.removeAttribute('selected');
        opt.classList.remove('selected');
      });
      option.setAttribute('selected', '');
      option.classList.add('selected');
    }

    updateOptionInputValue(option) {
      /* ===== Update the hidden input value with the selected option's value ===== */
      const value = option.textContent;
      this.dropdownInput.value = value;
    }

    handleOptionKeyDown(event) {
      /* ===== Handle the keydown event on the dropdown options ===== */
      if (event.key === 'Enter') {
        this.handleOptionClick(event.target);
      }
    }

    closeDropdownOnFocusOut() {
      /* ===== Use setTimeout to delay the check because the new focus target is not yet focused ===== */
      setTimeout(() => {
        if (!this.contains(document.activeElement)) {
          this.updateButtonStates();
          this.updateDropdownClasses(true);
          this.closeDropdown();
        }
      }, 0);
    }

    disconnectedCallback() {
      this.dropdownTrigger.removeEventListener('click', this.toggleDropdown);
      document.removeEventListener('click', this.onDocumentClick);
      this.options.forEach(option => option.removeEventListener('click', this.handleOptionClick));
    }
  }
  customElements.define('theme-dropdown', ThemeDropdown);
}
/******/ })()
;