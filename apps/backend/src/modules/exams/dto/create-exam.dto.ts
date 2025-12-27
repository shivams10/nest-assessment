import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateExamDto {
  @IsUUID()
  @IsNotEmpty()
  collegeSessionId!: string;

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
