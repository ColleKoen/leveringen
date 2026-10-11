// backend/src/routes/update.ts

import express from 'express';

import { reconnectFM } from '../utils/reconnect.utils';
import { fileMakerAuth } from '../middleware/fileMakerAuth';
import { updateBestelling, updateBestellijn } from '../services/updateService';

const router = express.Router();

export default router.post('/', fileMakerAuth,
  async (req, res) => {

    try {

      const { bestellingRecordId, volledigGeleverd, bestellijnen } = req.body;

      if (!bestellingRecordId) return res.status(400).json({ ok: false, error: 'bestellingRecordId ontbreekt.' });
      if (!Array.isArray(bestellijnen)) return res.status(400).json({ ok: false, error: 'bestellijnen ontbreken.' });

      console.log('UPDATE:', { bestellingRecordId, volledigGeleverd, bestellijnen });

      await reconnectFM(
        req,
        async (token) => {

          // Hoofdrecord aanpassen.
          await updateBestelling(token, bestellingRecordId, volledigGeleverd);

          // Bestellijnen aanpassen.
          for (const bestellijn of bestellijnen) { await updateBestellijn(token, bestellijn.recordId, bestellijn.geleverd); }
        }
      );

      return res.json({ ok: true });
    }
    catch (err) {
      console.error('APPLY UPDATE ERROR:', err);
      return res.status(500).json({ ok: false, error: 'Bestelling kon niet worden aangepast.' });
    }
  }
);