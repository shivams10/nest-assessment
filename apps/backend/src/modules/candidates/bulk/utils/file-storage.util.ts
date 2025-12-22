import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function saveErrorCsv(buffer: Buffer): Promise<string> {
  const filename = `bulk-error-${randomUUID()}.csv`;
  const dir = join(process.cwd(), 'uploads');

  await fs.mkdir(dir, { recursive: true });
  const path = join(dir, filename);

  await fs.writeFile(path, buffer);

  return `/uploads/${filename}`;
}
