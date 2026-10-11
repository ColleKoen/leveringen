// frontend/src/types/frontend.types.ts

export interface Bestellijst {
  recordId: string;
  bestelLijnenId: string;
  bestelNummerId: string;
  dossiernaam: string;
  leverancier: string;
  volledigGeleverd: boolean;
  leveringsdatum: string;
  besteldDoor: string;
}

export interface Bestellijn {
  recordId: string;
  omschrijving: string;
  aantal: number;
  geleverd: boolean;
}