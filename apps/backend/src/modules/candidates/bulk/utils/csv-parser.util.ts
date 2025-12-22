import { parse } from 'csv-parse/sync';

export interface ParsedCandidateRow {
  email: string;
  firstName: string;
  lastName: string;
}

type RawCsvRow = {
  email?: string;
  first_name?: string;
  last_name?: string;
};

export function parseCandidateCsv(buffer: Buffer): ParsedCandidateRow[] {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawCsvRow[];

  return records.map((row) => ({
    email: row.email?.toLowerCase() ?? '',
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
  }));
}
