// backend/src/routes/logout.ts

import express from 'express';

import { closeFileMakerSession } from '../config/filemaker';
import { getSession, deleteSession } from '../config/sessionStore';

const router = express.Router();

// LOGOUT.
router.post('/', async (req, res) => {

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) return res.json({ ok: true });

  const sessionId = authorization.substring(7);
  const session = getSession(sessionId);

  if (session) {
    try {
      // FileMaker sessie sluiten.
      await closeFileMakerSession(session.token);
    }
    catch (err) {
      console.error('FileMaker logout fout:', err);
    }
    // Onze eigen sessie verwijderen.
    deleteSession(sessionId);
  }

  return res.json({ ok: true });
});

export default router;