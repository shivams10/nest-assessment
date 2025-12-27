import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListResultsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsString()
  collegeSessionId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  selectedForNextRound?: boolean;
}
