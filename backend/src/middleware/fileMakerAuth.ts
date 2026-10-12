// backend/src/middleware/fileMakerAuth.ts

import type { Request, Response, NextFunction } from 'express';
import { getSession, type Session } from '../config/sessionStore';

// Express Request uitbreiden met onze FileMaker gegevens.
declare global {
  namespace Express {
    interface Request {
      fmSessionId?: string;
      fmSession?: Session;
      fmToken?: string;
    }
  }
}

// Controleer de eigen sessie van de gebruiker.
export function fileMakerAuth(req: Request, res: Response, next: NextFunction) {

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) return res.status(401).json({ ok: false, error: 'Geen sessie' });

  const sessionId = authorization.substring(7);
  const session = getSession(sessionId);

  if (!session) return res.status(401).json({ ok: false, error: 'Ongeldige of verlopen sessie' });

  // Beschikbaar maken voor de volgende route.
  req.fmSessionId = sessionId;
  req.fmSession = session;
  req.fmToken = session.token;

  next();
}