// backend/src/routes/session.ts

import express from 'express';

import { fileMakerAuth } from '../middleware/fileMakerAuth';

const router = express.Router();

// Controleren of de huidige sessie nog geldig is.
router.get('/', fileMakerAuth, (_req, res) => { return res.json({ ok: true }); });

export default router;