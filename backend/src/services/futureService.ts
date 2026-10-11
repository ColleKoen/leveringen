// backend/src/services/futureService.ts

import {
  findLayoutRecords
} from '../config/filemaker';


const DOSSIER_LAYOUT = 'WEBDOSSIERS';


export async function listDossiers(
  token: string
) {

  const query = [
    {
      flag_web_active_c: '1'
    }
  ];

  const { records } =
    await findLayoutRecords(
      token,
      DOSSIER_LAYOUT,
      query,
      10
    );

  console.log(
    'FILEMAKER RECORDS:',
    records.length
  );

  return records;
}