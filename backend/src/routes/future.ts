// backend/src/routes/future.ts
//
// Dit zit hier tussen als test.
//

import express from 'express';

import { reconnectFM } from '../utils/reconnect.utils';
import { listDossiers } from '../services/futureService';
import { fileMakerAuth } from '../middleware/fileMakerAuth';

const router = express.Router();

router.get('/', fileMakerAuth,
  async (req, res) => {
    try {
      console.log('FUTURE REQUEST');

      const dossiers = await reconnectFM(req, (token) => listDossiers(token));

      console.log('FUTURE DOSSIERS:', dossiers.length);

      return res.json({ ok: true, dossiers });
    }
    catch (err) {
      console.error('FUTURE ERROR:', err);
      return res.status(500).json({ ok: false, error: 'Server fout' });
    }
  }
);

export default router;