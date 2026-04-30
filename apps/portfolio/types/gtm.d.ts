declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown> | unknown[]>;
  }
}

export {};
