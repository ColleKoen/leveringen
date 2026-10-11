// backend/src/types/backend.types.ts

// Bestellijst --> Algemeen_list_bestelling.
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

// Bestellijn --> _bestellijnen.
export interface Bestellijn {
  recordId: string;
  omschrijving: string;
  aantal: number;
  geleverd: boolean;
}