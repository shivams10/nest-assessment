import { parse } from 'csv-parse/sync';
import { QuestionCategory, QuestionType } from '@prisma/client';

export interface ParsedQuestionRow {
  stem: string;
  type: QuestionType;
  category: QuestionCategory;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOptions: string; // Comma-separated indices (e.g., "1" or "1,3")
}

interface RawCsvRow {
  stem?: string;
  type?: string;
  category?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  correctOptions?: string;
}

export function parseQuestionCsv(buffer: Buffer): ParsedQuestionRow[] {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row: RawCsvRow) => ({
    stem: row.stem ?? '',
    type: (row.type ?? 'single_select') as QuestionType,
    category: (row.category ?? 'aptitude') as QuestionCategory,
    option1: row.option1 ?? '',
    option2: row.option2 ?? '',
    option3: row.option3 ?? '',
    option4: row.option4 ?? '',
    correctOptions: row.correctOptions ?? '',
  }));
}

