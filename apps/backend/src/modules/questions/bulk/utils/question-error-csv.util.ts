import { stringify } from 'csv-stringify/sync';

export interface FailedQuestionRow {
  rowNumber: number;
  stem?: string;
  type?: string;
  category?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  correctOptions?: string;
  reason: string;
}

export function generateQuestionErrorCsv(rows: FailedQuestionRow[]): Buffer {
  if (rows.length === 0) {
    return Buffer.from('');
  }

  const headers = [
    'rowNumber',
    'stem',
    'type',
    'category',
    'option1',
    'option2',
    'option3',
    'option4',
    'correctOptions',
    'reason',
  ];

  const csvData = [
    headers,
    ...rows.map((row) => [
      row.rowNumber.toString(),
      row.stem ?? '',
      row.type ?? '',
      row.category ?? '',
      row.option1 ?? '',
      row.option2 ?? '',
      row.option3 ?? '',
      row.option4 ?? '',
      row.correctOptions ?? '',
      row.reason,
    ]),
  ];

  return Buffer.from(stringify(csvData));
}

