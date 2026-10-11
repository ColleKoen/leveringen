// backend/src/config/sessionStore.ts

import crypto from 'crypto';

export interface Session {
  token: string;
  username: string;
  password: string;
}

// Sessies in geheugen bewaren.
const sessions = new Map<string, Session>();

// Nieuwe sessie aanmaken.
export function createSession(username: string, password: string, token: string): string {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { token, username, password });
  return sessionId;
}

// Sessie ophalen.
export function getSession(sessionId: string): Session | undefined { return sessions.get(sessionId); }

// FileMaker token vervangen.
// Gebruikt wanneer FileMaker token 952 verlopen is.
export function updateSessionToken(sessionId: string, token: string): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.token = token;
}

// Sessie verwijderen.
export function deleteSession(sessionId: string): void { sessions.delete(sessionId); }

