import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(2000)
  year!: number;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsOptional()
  @IsUUID()
  collegeId?: string;
}
