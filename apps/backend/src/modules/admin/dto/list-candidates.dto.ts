import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListCandidatesDto {
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
  @Transform(({ value }) => {
    // Handle undefined/null - return undefined to skip filter
    if (value === undefined || value === null) return undefined;

    // Convert string/number to boolean
    if (value === 'true' || value === true || value === 1 || value === '1') {
      return true;
    }
    if (value === 'false' || value === false || value === 0 || value === '0') {
      return false;
    }

    // For any other value, return undefined to skip filter
    return undefined;
  })
  selectedForNextRound?: boolean;
}
