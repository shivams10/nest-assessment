import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import type { Request } from 'express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Read directly from process.env rather than the injected ConfigService:
// FileInterceptor's options are evaluated once at decorator/class-definition
// time, before Nest's DI container exists, so a service instance can't be
// resolved here. Mirrors ConfigService#resumeUploadDir's own default.
export const RESUME_UPLOAD_DIR =
  process.env.RESUME_UPLOAD_DIR || './uploads/resumes';

// multer's diskStorage requires the destination directory to already exist.
mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });

export const RESUME_UPLOAD_OPTIONS: MulterOptions = {
  storage: diskStorage({
    destination: RESUME_UPLOAD_DIR,
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      cb(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: MAX_RESUME_SIZE_BYTES },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(
        new BadRequestException('Resume must be a PDF, DOC, or DOCX file'),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
