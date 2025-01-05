declare module 'fbq' {
  type TrackType = string;
  
  export function init(pixelId: string): void;
  export function track(event: TrackType, params?: Record<string, unknown>): void;
} 