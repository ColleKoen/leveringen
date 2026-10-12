// backend/src/services/bestellijnService.ts

import { findLayoutRecords } from '../config/filemaker';

import type { Bestellijn } from '../types/backend.types';
import type { FMRecord } from '../types/filemaker.types';

const BESTELLIJN_LAYOUT = '_bestellijnen';

export async function listBestellijnen(token: string, bestelLijnenId: string): Promise<Bestellijn[]> {

  // Query instellen.
  const query = [{ _k2_bestelling_ID: bestelLijnenId }];

  // --> FileMaker.
  const { records }: { records: FMRecord[]; } = await findLayoutRecords(token, BESTELLIJN_LAYOUT, query, 500);

  // Records omzetten.
  const bestellijnen: Bestellijn[] = records.map((record) => {

    const fd = record.fieldData;

    return {
      recordId: String(record.recordId ?? ''),
      aantal: Number(fd['aantal'] ?? 0),
      omschrijving: String(fd['omschrijving'] ?? ''),
      geleverd: fd['flag_geleverd'] === 1 || fd['flag_geleverd'] === '1'
    };
  });

  return bestellijnen;
}