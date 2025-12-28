import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateExamDto {
  @IsOptional()
  @IsUUID()
  collegeSessionId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  description?: string;

  @IsDateString()
  windowStartsAt!: string;

  @IsDateString()
  windowEndsAt!: string;

  @IsInt()
  @Min(1)
  durationSeconds!: number;

  @IsString()
  @IsNotEmpty()
  masterPassword!: string;
}
