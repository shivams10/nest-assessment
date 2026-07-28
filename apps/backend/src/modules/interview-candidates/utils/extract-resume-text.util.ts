import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

/**
 * Best-effort text extraction for AI parsing. Legacy .doc (pre-2007 binary
 * format) has no reliable pure-JS extractor available, so it's skipped —
 * the resume is still stored and downloadable, just not auto-parsed.
 */
export async function extractResumeText(
  buffer: Buffer,
  mimetype: string,
): Promise<string | null> {
  if (mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return null;
}
