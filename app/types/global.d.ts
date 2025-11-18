export {};

declare global {
  interface Window {
    gtag: (
      command: string,
      target: string | Date,
      params?: Record<string, unknown>
    ) => void;
    gtag_report_conversion?: (url?: string, value?: number, transactionId?: string) => boolean;
    gtag_report_add_to_cart_conversion?: (url?: string, value?: number) => boolean;
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
