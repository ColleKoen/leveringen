// frontend/src/utils/date.utils.ts

export function parseFMDate(fmDate: string): Date {
  const [mm, dd, yyyy] = fmDate.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

export function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}