import { IsOptional, IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamStatusFilter {
  draft = 'draft',
  published = 'published',
}

export class ListExamsDto {
  @IsOptional()
  @IsUUID()
  collegeSessionId?: string;

  @IsOptional()
  @IsEnum(ExamStatusFilter)
  status?: ExamStatusFilter;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
