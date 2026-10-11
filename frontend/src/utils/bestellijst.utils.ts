// frontend/src/utils/bestellijst.utils.ts

import type { Bestellijst } from '../types/frontend.types';
import { parseFMDate } from './date.utils';


// Status van een bestelling bepalen.
export function getBestellingStatus(
  bestelling: Bestellijst
): string {

  // Geleverd heeft altijd voorrang.
  if (bestelling.volledigGeleverd) {
    return 'geleverd';
  }

  const leveringsdatum =
    parseFMDate(bestelling.leveringsdatum);

  const vandaag =
    new Date();

  // Tijd verwijderen.
  vandaag.setHours(0, 0, 0, 0);
  leveringsdatum.setHours(0, 0, 0, 0);


  // Levering is vandaag.
  if (
    leveringsdatum.getTime() ===
    vandaag.getTime()
  ) {
    return 'vandaag';
  }


  // Leveringsdatum is voorbij.
  if (leveringsdatum < vandaag) {
    return 'te laat';
  }


  // Leveringsdatum ligt in de toekomst.
  return 'besteld';
}