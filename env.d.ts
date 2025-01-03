declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_FB_PIXEL_ID: string;
      FB_ACCESS_TOKEN: string;
      NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
      GA_API_SECRET: string;
      NEXT_PUBLIC_GOOGLE_ADS_ID: string;
    }
  }
}

export {}; 