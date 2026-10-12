// backend/src/routes/ping.ts

import express from 'express';

const router = express.Router();

// Controle of de backend actief is.
router.get('/', (_req, res) => {
  return res.json({ ok: true, message: 'Backend is actief' });
});

export default router;