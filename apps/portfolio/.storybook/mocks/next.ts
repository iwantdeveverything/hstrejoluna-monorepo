const registerMatchMediaMock = () => {
  if (typeof window === "undefined" || typeof window.matchMedia === "function") {
    return;
  }

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
};

const registerResizeObserverMock = () => {
  if (typeof window === "undefined" || "ResizeObserver" in window) {
    return;
  }

  class MockResizeObserver {
    observe() {}

    unobserve() {}

    disconnect() {}
  }

  (window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
};

export const setupStorybookNextMocks = () => {
  registerMatchMediaMock();
  registerResizeObserverMock();
};
