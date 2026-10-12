// backend/src/routes/bestellijn.ts

import express from 'express';
import { reconnectFM } from '../utils/reconnect.utils';
import { fileMakerAuth } from '../middleware/fileMakerAuth';
import { listBestellijnen } from '../services/bestellijnService';

const router = express.Router();

router.get('/', fileMakerAuth, async (req, res) => {

  try {

    const bestelLijnenId = String(req.query.bestelLijnenId ?? '');

    if (!bestelLijnenId) return res.status(400).json({ ok: false, error: 'bestelLijnenId ontbreekt' });

    console.log('BESTELLIJN REQUEST:', bestelLijnenId);

    const bestellijnen = await reconnectFM(req, (token) => listBestellijnen(token, bestelLijnenId));

    return res.json({ ok: true, bestellijnen });

  }
  catch (err) {
    console.error('BESTELLIJN ERROR:', err);
    return res.status(500).json({ ok: false, error: 'Server fout' });
  }
}
);

export default router;