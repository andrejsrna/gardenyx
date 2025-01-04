import { getIronSession } from 'iron-session';
import { sessionConfig } from '../config/session';
import type { SessionData } from '../config/session';

export async function getSession(req?: Request, res?: Response) {
  if (req && res) {
    return getIronSession<SessionData>(req, res, sessionConfig);
  }
  // For API routes
  const response = new Response();
  return getIronSession<SessionData>(new Request(''), response, sessionConfig);
} 