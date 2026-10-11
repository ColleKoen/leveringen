// backend/src/services/bestellijstService.ts

import { findLayoutRecords } from '../config/filemaker';
import { Bestellijst } from '../types/backend.types';
import { FMRecord } from '../types/filemaker.types';

const BESTELLIJST_LAYOUT = 'Algemeen_list_bestelling';

export async function listBestellingen(token: string): Promise<Bestellijst[]> {

  // Datum 6 maanden terug.
  const date = new Date();
  date.setMonth(date.getMonth() - 6);

  // FileMaker datum: MM/DD/YYYY.
  const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/` + `${String(date.getDate()).padStart(2, '0')}/` + `${date.getFullYear()}`;

  // Query instellen.
  const query = [{ _k2_leveringsadres_contact_ID: '52', leveringsdatum: `${formattedDate}..` }];

  // --> FileMaker.
  const { records } = await findLayoutRecords(token, BESTELLIJST_LAYOUT, query, 5000);

  console.log('BESTELLIJST RECORDS:', records.length);

  // Records omzetten.
  const bestellingen: Bestellijst[] = records.map((record: FMRecord) => {

    const fd = record.fieldData;

    return {
      recordId: String(record.recordId ?? ''),
      bestelLijnenId: String(fd['_k1_bestelling_ID'] ?? ''),
      bestelNummerId: String(fd['bestellings_nrT_c'] ?? ''),
      dossiernaam: String(fd['bestellingen_dossiers::dossiernaam'] ?? ''),
      leverancier: String(fd['bestellingen_contactenLeverancier::Firma_naam_c'] ?? ''),
      volledigGeleverd: fd['volledig_geleverd_aec'] === 1 || fd['volledig_geleverd_aec'] === '1',
      leveringsdatum: String(fd['leveringsdatum'] ?? ''),
      besteldDoor: String(fd['bestellingen_bestelddoor::naam_voornaam_c'] ?? '')
    };
  });

  return bestellingen;
}