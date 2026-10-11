// backend/src/services/updateService.ts

import { fmFetch } from '../config/filemaker';

const BESTELLIJN_LAYOUT = '_bestellijnen';
const BESTELLIJST_LAYOUT = 'Algemeen_list_bestelling';

export interface BestellijnUpdate {
  recordId: string;
  geleverd: boolean;
}

// Bestelling volledig geleverd aanpassen.
export async function updateBestelling(token: string, recordId: string, volledigGeleverd: boolean) {
  return await fmFetch(`/layouts/${BESTELLIJST_LAYOUT}/records/${recordId}`, { method: 'PATCH', token, body: { fieldData: { volledig_geleverd_aec: volledigGeleverd ? 1 : 0 } } });
}

// Bestellijn geleverd aanpassen.
export async function updateBestellijn(token: string, recordId: string, geleverd: boolean) {
  return await fmFetch(`/layouts/${BESTELLIJN_LAYOUT}/records/${recordId}`, { method: 'PATCH', token, body: { fieldData: { flag_geleverd: geleverd ? 1 : 0 } } });
}