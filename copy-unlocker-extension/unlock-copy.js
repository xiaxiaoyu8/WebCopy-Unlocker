(() => {
  const stateKey = "__copyUnlockerState__";
  const styleId = "__copyUnlockerStyle__";
  const toastId = "__copyUnlockerToast__";
  const handlerProps = [
    "oncopy",
    "oncut",
    "onpaste",
    "onbeforecopy",
    "onbeforecut",
    "onbeforepaste",
    "oncontextmenu",
    "onselectstart",
    "ondragstart",
    "onmousedown",
    "onmouseup",
    "onkeydown",
    "onkeypress",
    "onkeyup"
  ];
  const hardBlockedEvents = new Set([
    "copy",
    "cut",
    "paste",
    "beforecopy",
    "beforecut",
    "beforepaste",
    "contextmenu",
    "selectstart",
    "dragstart"
  ]);
  const pointerEvents = new Set(["mousedown", "mouseup"]);
  const keyboardEvents = new Set(["keydown", "keypress", "keyup"]);

  const state = window[stateKey] || {
    installed: false,
    cleanupTimer: null,
    cleanupRuns: 0,
    observer: null,
    originalAddEventListener: null,
    wrappedListeners: new WeakMap()
  };
  window[stateKey] = state;

  const isEditable = (target) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        "input, textarea, select, button, [contenteditable=''], [contenteditable='true'], [role='textbox']"
      )
    );
  };

  const isCopyShortcut = (event) => {
    if (!event || !(event.ctrlKey || event.metaKey)) {
      return false;
    }

    const key = String(event.key || "").toLowerCase();
    return key === "a" || key === "c" || key === "x" || key === "v" || key === "insert";
  };

  const shouldStopPageHandler = (event) => {
    if (hardBlockedEvents.has(event.type)) {
      return true;
    }

    if (keyboardEvents.has(event.type)) {
      return isCopyShortcut(event);
    }

    if (pointerEvents.has(event.type)) {
      return event.button === 0 && !isEditable(event.target);
    }

    return false;
  };

  const stopPageHandler = (event) => {
    if (shouldStopPageHandler(event)) {
      event.stopImmediatePropagation();
    }
  };

  const clearHandlerProperties = (target) => {
    for (const prop of handlerProps) {
      try {
        target[prop] = null;
      } catch (_) {
        // Ignore browser-protected targets.
      }
    }
  };

  const cleanElement = (element) => {
    if (!(element instanceof Element)) {
      return;
    }

    clearHandlerProperties(element);

    for (const prop of handlerProps) {
      if (element.hasAttribute(prop)) {
        element.removeAttribute(prop);
      }
    }
  };

  const cleanTree = (root = document) => {
    clearHandlerProperties(window);
    clearHandlerProperties(document);
    if (document.documentElement) {
      cleanElement(document.documentElement);
    }
    if (document.body) {
      cleanElement(document.body);
    }

    const selector = handlerProps.map((prop) => `[${prop}]`).join(",");
    root.querySelectorAll?.(selector).forEach(cleanElement);
  };

  const installStyle = () => {
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.documentElement.appendChild(style);
    }

    style.textContent = `
      * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
  };

  const wrapListener = (type, listener) => {
    if (!listener || (typeof listener !== "function" && typeof listener.handleEvent !== "function")) {
      return listener;
    }

    let byType = state.wrappedListeners.get(listener);
    if (!byType) {
      byType = new Map();
      state.wrappedListeners.set(listener, byType);
    }

    if (byType.has(type)) {
      return byType.get(type);
    }

    const wrapped = function wrappedCopyUnlockerListener(event) {
      if (shouldStopPageHandler(event)) {
        return undefined;
      }

      if (typeof listener === "function") {
        return listener.call(this, event);
      }

      return listener.handleEvent.call(listener, event);
    };

    byType.set(type, wrapped);
    return wrapped;
  };

  const installAddEventListenerGuard = () => {
    if (state.originalAddEventListener) {
      return;
    }

    state.originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.removeEventListener = function removeCopyUnlockerGuard(type, listener, options) {
      const eventType = String(type);
      const wrapped = state.wrappedListeners.get(listener)?.get(eventType);
      if (wrapped) {
        originalRemoveEventListener.call(this, eventType, wrapped, options);
      }
      return originalRemoveEventListener.call(this, eventType, listener, options);
    };


    EventTarget.prototype.addEventListener = function addCopyUnlockerGuard(type, listener, options) {
      const eventType = String(type);

      if (hardBlockedEvents.has(eventType)) {
        return undefined;
      }

      if (keyboardEvents.has(eventType) || pointerEvents.has(eventType)) {
        return state.originalAddEventListener.call(this, type, wrapListener(eventType, listener), options);
      }

      return state.originalAddEventListener.call(this, type, listener, options);
    };
  };

  const installEventFirewall = () => {
    const targets = [window, document, document.documentElement, document.body].filter(Boolean);
    const events = [...hardBlockedEvents, ...keyboardEvents, ...pointerEvents];

    for (const target of targets) {
      for (const eventName of events) {
        target.addEventListener(eventName, stopPageHandler, true);
      }
    }
  };

  const installObserver = () => {
    if (state.observer || !document.documentElement) {
      return;
    }

    state.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          cleanElement(mutation.target);
          continue;
        }

        for (const node of mutation.addedNodes) {
          cleanElement(node);
          node.querySelectorAll?.("*").forEach(cleanElement);
        }
      }
    });

    state.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: handlerProps
    });
  };

  const startShortCleanupLoop = () => {
    if (state.cleanupTimer) {
      clearInterval(state.cleanupTimer);
    }

    state.cleanupRuns = 0;
    state.cleanupTimer = setInterval(() => {
      cleanTree(document);
      state.cleanupRuns += 1;

      if (state.cleanupRuns >= 20) {
        clearInterval(state.cleanupTimer);
        state.cleanupTimer = null;
      }
    }, 500);
  };

  const showToast = () => {
    let toast = document.getElementById(toastId);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = toastId;
      toast.style.cssText = [
        "position:fixed",
        "top:14px",
        "right:14px",
        "z-index:2147483647",
        "padding:6px 10px",
        "border-radius:999px",
        "background:rgba(22,163,74,.88)",
        "color:#fff",
        "font:12px/1.2 Arial,sans-serif",
        "box-shadow:0 4px 14px rgba(22,163,74,.24)",
        "pointer-events:none",
        "opacity:0",
        "transform:translateY(-4px)",
        "transition:opacity .18s ease,transform .18s ease"
      ].join(";");
      document.documentElement.appendChild(toast);
    }

    toast.textContent = "复制限制已解除 ✓";
    clearTimeout(toast.__copyUnlockerTimer);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    toast.__copyUnlockerTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-4px)";
    }, 1200);
  };

  installStyle();
  cleanTree(document);
  installObserver();

  if (!state.installed) {
    installEventFirewall();
    state.installed = true;
  }

  installAddEventListenerGuard();
  startShortCleanupLoop();
  showToast();
  console.log("Copy restrictions unlocked.");
})();
