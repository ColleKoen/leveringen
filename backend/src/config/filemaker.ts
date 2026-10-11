// backend/src/config/filemaker.ts

const FILEMAKER_API_VERSION = 'vLatest';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function getBaseUrl(): string {
  return getRequiredEnv('FILEMAKER_BASE_URL').replace(/\/$/, '');
}

function buildSessionsUrl(): string {
  const baseUrl = getBaseUrl();
  const database = encodeURIComponent(getRequiredEnv('FILEMAKER_DATABASE'));
  return `${baseUrl}/fmi/data/${FILEMAKER_API_VERSION}/databases/${database}/sessions`;
}

function getAuthHeader(username: string, password: string): string {
  const raw = `${username}:${password}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

export class FileMakerError extends Error {

  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'FileMakerError';
    this.status = status;
    this.code = code;
  }
}

export function isFileMakerAuthError(error: unknown): boolean {
  return (error instanceof FileMakerError && error.status === 401);
}

// FileMaker sessie openen.
export async function requestFileMakerSession(username: string, password: string): Promise<string> {

  const url = buildSessionsUrl();
  let response: Response;

  try {
    response = await fetch(url, { method: "POST", headers: { Authorization: getAuthHeader(username, password), "Content-Type": "application/json", }, body: JSON.stringify({}), });
  }
  catch (error) {
    console.error("========== FILEMAKER CONNECTION ERROR ==========");
    console.error("URL:", url);
    console.error("User:", username);
    console.error(error);
    console.error("================================================");

    throw new Error("Connection to FileMaker failed");
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  let data: any;

  try {
    data = JSON.parse(text);
  }
  catch {
    console.error("========== INVALID JSON ==========");
    console.error("URL:", url);
    console.error("User:", username);
    console.error("Status:", response.status);
    console.error("Content-Type:", contentType);
    console.error("Body:");
    console.error(text.substring(0, 2000));
    console.error("==================================");

    throw new Error("Invalid JSON returned by FileMaker");
  }

  if (!response.ok) {

    const code = data?.messages?.[0]?.code;
    const message = data?.messages?.[0]?.message || response.statusText;

    console.error("========== FILEMAKER LOGIN FAILED ==========");
    console.error("URL:", url);
    console.error("User:", username);
    console.error("Status:", response.status);
    console.error("Code:", code);
    console.error("Message:", message);
    console.error(data);
    console.error("============================================");

    throw new FileMakerError(`FileMaker login failed: ${message}`, response.status, code);
  }

  const token = data?.response?.token;

  if (!token) {
    console.error("========== NO TOKEN RECEIVED ==========");
    console.error("URL:", url);
    console.error("User:", username);
    console.error("Response:", data);
    console.error("=======================================");

    throw new Error("No token received from FileMaker");
  }
  return token;
}

// Alle records van een layout ophalen.
function buildLayoutRecordsUrl(layout: string, limit: number, offset: number): string {

  const baseUrl = getBaseUrl();
  const database = encodeURIComponent(getRequiredEnv('FILEMAKER_DATABASE'));
  const encodedLayout = encodeURIComponent(layout);
  const query = new URLSearchParams({ _limit: String(limit), _offset: String(offset), });

  return `${baseUrl}/fmi/data/${FILEMAKER_API_VERSION}/databases/${database}/layouts/${encodedLayout}/records?${query.toString()}`;
}

export async function getLayoutRecords(token: string, layout: string, limit: number = 100, offset: number = 1) {

  const response = await fetch(buildLayoutRecordsUrl(layout, limit, offset), { method: 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', }, });

  const data = await response.json();
  const code = data?.messages?.[0]?.code;
  const message = data?.messages?.[0]?.message || response.statusText;

  // Geen records = geen fout.
  if (code === '401' || message === 'Record is missing') return { records: [], foundCount: 0, returnedCount: 0, };
  if (!response.ok) throw new Error(`FileMaker read failed (${response.status}): ${message}`);

  return { records: data.response?.data || [], foundCount: data.response?.dataInfo?.foundCount || 0, returnedCount: data.response?.dataInfo?.returnedCount || 0, };
}

// Records zoeken.
function buildFindUrl(layout: string): string {
  const baseUrl = getBaseUrl();
  const database = encodeURIComponent(getRequiredEnv('FILEMAKER_DATABASE'));
  const encodedLayout = encodeURIComponent(layout);
  return `${baseUrl}/fmi/data/${FILEMAKER_API_VERSION}/databases/${database}/layouts/${encodedLayout}/_find`;
}

export async function findLayoutRecords(token: string, layout: string, query: Array<Record<string, string | boolean>>, limit: number = 5000) {

  const response = await fetch(buildFindUrl(layout), { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', }, body: JSON.stringify({ query, limit }), });

  const data = await response.json();

  if (!response.ok) {
    const code = data?.messages?.[0]?.code;
    const message = data?.messages?.[0]?.message || response.statusText;

    if (response.status === 401 || code === '401') throw new FileMakerError(`FileMaker unauthorized: ${message}`, response.status, code);

    throw new FileMakerError(`FileMaker find failed (${response.status}): ${message}`, response.status, code);
  }

  return { records: data.response?.data || [], foundCount: data.response?.dataInfo?.foundCount || 0, returnedCount: data.response?.dataInfo?.returnedCount || 0, };
}

// Algemene FileMaker fetch.
export async function fmFetch(path: string, options: { method?: string; token: string; body?: any; }) {

  const baseUrl = getBaseUrl();
  const database = encodeURIComponent(getRequiredEnv('FILEMAKER_DATABASE'));
  const url = `${baseUrl}/fmi/data/${FILEMAKER_API_VERSION}/databases/${database}${path}`;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${options.token}`, 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const json = await res.json();
  const code = json?.messages?.[0]?.code;

  // Geen records = geen fout.
  if (code === '401') return { ...json, response: { ...json.response, data: [] } };

  // Echte fout.
  if (!res.ok || code !== '0') {

    // Verlopen FileMaker token.
    if (code === '952') throw new FileMakerError('FileMaker token verlopen', 401, code);

    // Andere FileMaker fout.
    console.error('FILEMAKER ERROR:', json);

    throw new FileMakerError(`FileMaker API fout (${code})`, res.status, code);
  }

  return json;
}

// FileMaker sessie sluiten.
function buildSessionTokenUrl(token: string): string {
  return `${buildSessionsUrl()}/${encodeURIComponent(token)}`;
}

export async function closeFileMakerSession(token: string): Promise<void> {

  const response = await fetch(buildSessionTokenUrl(token), { method: "DELETE", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", }, });

  // Sessie correct gesloten.
  if (response.ok) return;

  const bodyText = await response.text();

  // Token is al verlopen of ongeldig.
  if (response.status === 401 && bodyText.includes('"code":"952"')) {
    console.log("FileMaker sessie was reeds verlopen.");
    return;
  }

  throw new Error(`FileMaker session close failed (${response.status}): ${bodyText}`);
}