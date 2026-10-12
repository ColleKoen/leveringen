// backend/src/routes/auth.ts

import express from 'express';

import { createSession } from '../config/sessionStore';
import { requestFileMakerSession, closeFileMakerSession } from '../config/filemaker';

const router = express.Router();

// LOGIN.
router.post('/login', async (req, res) => {

  const { username, password } = req.body;

  // Basiscontrole.
  if (!username || !password) return res.status(400).json({ ok: false, error: 'Gebruikersnaam en wachtwoord zijn verplicht' });

  let fmToken: string | null = null;

  try {
    // Inloggen bij FileMaker.
    fmToken = await requestFileMakerSession(username, password);

    // Eigen sessie aanmaken.
    const sessionId = createSession(username, password, fmToken);

    return res.json({ ok: true, sessionId });
  }
  catch (err) {

    console.error('LOGIN ERROR:', err);

    // Als FileMaker-login wel gelukt was maar daarna iets fout ging,
    // de FileMaker sessie netjes proberen sluiten.
    if (fmToken) {
      try {
        await closeFileMakerSession(fmToken);
      }
      catch {
        // oorspronkelijke fout behouden
      }
    }

    return res.status(401).json({ ok: false, error: 'Aanmelden mislukt' });
  }
});

export default router;