class EventBus {
  constructor() {
    this.listeners = {};
  }

  // Replaces 'addEventListener' with 'on', 'removeEventListener' with 'off', and 'dispatchEvent' with 'emit'
  // Usage: eventBus.on('qty:change', (data) => console.log(data)); eventBus.emit('qty:change', { value: 1, sectionId: 1 });
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event].delete(callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

// Creating a single instance and attaching it to the window object
window.eventBus = new EventBus();
