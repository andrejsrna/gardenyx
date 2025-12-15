declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FB_CONVERSION_API_ACCESS_TOKEN: string;
      NEXT_PUBLIC_FB_PIXEL_ID: string;
      NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
      GA_API_SECRET: string;
      NEXT_PUBLIC_GOOGLE_ADS_ID: string;
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
      SALES_SUSPENDED: string;
      SALES_SUSPENSION_MESSAGE: string;
      POSTGRES_URL?: string;
      BREVO_API_KEY: string;
      BREVO_SENDER_EMAIL?: string;
      BREVO_SENDER_NAME?: string;
      BREVO_LIST_ID: string;
      NEWSLETTER_ADMIN_TOKEN: string;
      POSTGRES_URL_PRISMA?: string;
      PRISMA_DB_SCHEMA?: string;
      ADMIN_DASHBOARD_USER: string;
      ADMIN_DASHBOARD_PASSWORD: string;
    }
  }
}

export {};
