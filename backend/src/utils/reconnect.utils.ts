// backend/src/utils/reconnect.utils.ts

import type { Request } from 'express';

import { updateSessionToken } from '../config/sessionStore';
import { requestFileMakerSession, FileMakerError } from '../config/filemaker';


// FileMaker actie uitvoeren.
// Bij een verlopen token automatisch opnieuw aanmelden.
export async function reconnectFM<T>(req: Request, operation: (token: string) => Promise<T>): Promise<T> {

  const session = req.fmSession;
  const sessionId = req.fmSessionId;

  let token = req.fmToken;

  if (!session || !sessionId || !token) throw new Error('FileMaker context ontbreekt op request');

  try {
    return await operation(token);
  }
  catch (err) {

    const tokenExpired = err instanceof FileMakerError && err.code === '952';

    if (!tokenExpired) throw err;
    console.log('FileMaker token verlopen. Nieuwe sessie aanvragen.');

    // Opnieuw aanmelden bij FileMaker.
    const newToken = await requestFileMakerSession(session.username, session.password);

    // Nieuwe token bewaren in onze sessie.
    updateSessionToken(sessionId, newToken);

    // Ook huidige request bijwerken.
    req.fmToken = newToken;

    token = newToken;

    // De oorspronkelijke FileMaker actie opnieuw uitvoeren.
    return await operation(token);

  }
}