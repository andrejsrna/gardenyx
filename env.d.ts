declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FB_CONVERSION_API_ACCESS_TOKEN: string;
      NEXT_PUBLIC_FB_PIXEL_ID: string;
      NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
      GA_API_SECRET: string;
      NEXT_PUBLIC_GOOGLE_ADS_ID: string;
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    }
  }
}

export {};
