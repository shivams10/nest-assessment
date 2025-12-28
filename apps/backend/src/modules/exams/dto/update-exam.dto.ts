import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class UpdateExamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  windowStartsAt?: string;

  @IsOptional()
  @IsDateString()
  windowEndsAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;

  @IsOptional()
  @IsUUID()
  collegeSessionId?: string;
}
