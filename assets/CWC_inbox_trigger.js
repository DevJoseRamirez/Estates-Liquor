/* Shared Shopify Inbox trigger — any element with [data-inbox-trigger] toggles the Inbox chat.
   Loaded by every section that renders a chat button; binds each button once. */
(function () {
  'use strict';

  // Inbox renders its launcher inside nested shadow roots (<shopify-chat> → <shopify-agent-runtime>),
  // so walk any open shadow roots looking for the button it marks as part="activator".
  function findInboxActivator(node) {
    if (!node) return null;
    const match = node.querySelector('[part~="activator"]');
    if (match) return match;
    const hosts = node.querySelectorAll('*');
    for (let i = 0; i < hosts.length; i++) {
      if (hosts[i].shadowRoot) {
        const found = findInboxActivator(hosts[i].shadowRoot);
        if (found) return found;
      }
    }
    return null;
  }

  function getInboxActivator() {
    const host = document.querySelector('shopify-chat');
    return host ? findInboxActivator(host.shadowRoot) : null;
  }

  function initTrigger(trigger) {
    if (!trigger || trigger.dataset.cwcInboxReady === 'true') return;
    trigger.dataset.cwcInboxReady = 'true';

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      // Inbox closes its panel on outside clicks, so keep this click from reaching the document
      event.stopPropagation();
      const fallback = trigger.getAttribute('href');
      const started = Date.now();

      // The Inbox script loads async; give it a few seconds before using the fallback link
      (function tryOpen() {
        const activator = getInboxActivator();
        if (activator) {
          // Defer so the toggle happens after this click has finished dispatching.
          // The launcher toggles, so a second click on the trigger closes an open chat.
          setTimeout(function () {
            activator.click();
          }, 0);
          return;
        }
        if (Date.now() - started < 3000) {
          setTimeout(tryOpen, 150);
        } else if (fallback && fallback !== '#') {
          window.location.href = fallback;
        }
      })();
    });
  }

  function initAll(root) {
    (root || document).querySelectorAll('[data-inbox-trigger]').forEach(initTrigger);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
