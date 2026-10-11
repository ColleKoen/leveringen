// backend/src/routes/bestellijst.ts

import express from 'express';

import { reconnectFM } from '../utils/reconnect.utils';
import { fileMakerAuth } from '../middleware/fileMakerAuth';
import { listBestellingen } from '../services/bestellijstService';

const router = express.Router();

router.get('/', fileMakerAuth,
  async (req, res) => {

    try {

      console.log('BESTELLIJST REQUEST');
      const bestellingen = await reconnectFM(req, (token) => listBestellingen(token));

      console.log('BESTELLIJST:', bestellingen.length);

      return res.json({ ok: true, bestellingen });

    }
    catch (err) {
      console.error('BESTELLIJST ERROR:', err);
      return res.status(500).json({ ok: false, error: 'Server fout' });
    }
  }
);

export default router;