export {};

declare global {
  interface Window {
    gtag: (
      command: string,
      target: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
    fbq: (
      action: string,
      event: string,
      params?: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => void;
    _fbq: {
      callMethod: (...args: unknown[]) => void;
      queue: unknown[];
      loaded: boolean;
      version: string;
      push: (arg: unknown) => void;
    };
  }
} 
