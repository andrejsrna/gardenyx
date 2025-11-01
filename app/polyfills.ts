if (typeof (globalThis as unknown as { File?: unknown }).File === 'undefined') {
  (globalThis as unknown as { File: unknown }).File = class {};
}


// Global guard against rare browsers/robots passing null events into touch handlers
(() => {
  if (typeof window === 'undefined') return;

  const touchTypes = new Set(['touchstart', 'touchmove', 'touchend', 'touchcancel']);

  const isTouchesReadError = (error: unknown): boolean => {
    if (!error) return false;
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.includes("reading 'touches'");
  };

  const wrapListener = (listener: EventListenerOrEventListenerObject): EventListenerOrEventListenerObject => {
    if (typeof listener === 'function') {
      return function wrappedListener(this: unknown, evt: Event | null) {
        if (!evt) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[polyfills] Ignored null event for touch handler');
          }
          return;
        }
        try {
          return (listener as EventListener).call(this, evt);
        } catch (err) {
          if (isTouchesReadError(err)) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('[polyfills] Swallowed touches read error in touch handler');
            }
            return;
          }
          throw err;
        }
      } as EventListener;
    }

    // Listener object with handleEvent
    if (listener && typeof (listener as { handleEvent?: unknown }).handleEvent === 'function') {
      const original = (listener as unknown as { handleEvent: (evt: Event) => void }).handleEvent;
      (listener as unknown as { handleEvent: (evt: Event | null) => void }).handleEvent = function wrappedHandleEvent(evt: Event | null) {
        if (!evt) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[polyfills] Ignored null event for touch handler (object)');
          }
          return;
        }
        try {
          return original.call(this, evt);
        } catch (err) {
          if (isTouchesReadError(err)) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('[polyfills] Swallowed touches read error in touch handler (object)');
            }
            return;
          }
          throw err;
        }
      };
      return listener;
    }

    return listener;
  };

  const patchTarget = (target: { addEventListener: typeof window.addEventListener }) => {
    const originalAdd = target.addEventListener;
    target.addEventListener = function patchedAddEventListener(
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (listener && touchTypes.has(type)) {
        return originalAdd.call(this, type, wrapListener(listener) as EventListenerOrEventListenerObject, options as never);
      }
      return originalAdd.call(this, type, listener as EventListenerOrEventListenerObject, options as never);
    } as typeof window.addEventListener;
  };

  try {
    patchTarget(window);
    patchTarget(document);
  } catch {
    // do nothing if patching fails
  }
})();

