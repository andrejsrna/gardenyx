import { SessionOptions } from 'iron-session';

export const sessionConfig: SessionOptions = {
  cookieName: 'session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Type for session data
export interface SessionData {
  customerId?: string;
  customerToken?: string;
  isLoggedIn: boolean;
  csrfToken?: string;
}

// Declare session type for iron-session
declare module 'iron-session' {
  interface IronSessionData {
    customerId?: number;
    customerToken?: string;
    isLoggedIn: boolean;
    csrfToken?: string;
  }
} 
