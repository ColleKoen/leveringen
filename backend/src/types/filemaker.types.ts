// backend/src/types/filemaker.types.ts

export type FMValue =
  | string
  | number
  | boolean
  | null;

export interface FMFieldData {
  [key: string]: FMValue;
}

export interface FMRecord {
  fieldData: FMFieldData;
  recordId?: string;
}