import { parse } from 'csv-parse/sync';

export interface ParsedCandidateRow {
  email: string;
  firstName: string;
  lastName: string;
}

interface RawCsvRow {
  email?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
}

export function parseCandidateCsv(buffer: Buffer): ParsedCandidateRow[] {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row: RawCsvRow) => ({
    email: (row.email ?? '').toLowerCase(),
    firstName: row.firstName ?? row.first_name ?? '',
    lastName: row.lastName ?? row.last_name ?? '',
  }));
}
