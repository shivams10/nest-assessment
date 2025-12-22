import { stringify } from 'csv-stringify/sync';

export interface FailedCandidateRow {
  email: string;
  firstName: string;
  lastName: string;
  reason: string;
}

export function generateErrorCsv(rows: FailedCandidateRow[]): Buffer {
  const csv = stringify(rows, {
    header: true,
    columns: ['email', 'firstName', 'lastName', 'reason'],
  });

  return Buffer.from(csv);
}
