import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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
  @Transform(({ value }) => {
    console.log(
      `[DEBUG] Transform decorator - received value: ${JSON.stringify(value)}, type: ${typeof value}`,
    );

    // Handle undefined/null - return undefined to skip filter
    if (value === undefined || value === null) {
      console.log(
        `[DEBUG] Transform - returning undefined (value is null/undefined)`,
      );
      return undefined;
    }

    // IMPORTANT: Check string FIRST before any type conversion happens
    // This prevents enableImplicitConversion from converting "false" -> true
    if (typeof value === 'string') {
      const lowercased = value.toLowerCase().trim();
      if (lowercased === 'true' || lowercased === '1') {
        console.log(`[DEBUG] Transform - converting string "${value}" to true`);
        return true;
      }
      if (lowercased === 'false' || lowercased === '0') {
        console.log(
          `[DEBUG] Transform - converting string "${value}" to false`,
        );
        return false;
      }
      // Unknown string value
      console.log(
        `[DEBUG] Transform - returning undefined (unrecognized string: "${value}")`,
      );
      return undefined;
    }

    // Handle boolean values (already converted)
    if (typeof value === 'boolean') {
      console.log(`[DEBUG] Transform - already boolean: ${value}`);
      return value;
    }

    // Handle number values
    if (typeof value === 'number') {
      console.log(`[DEBUG] Transform - converting number ${value} to boolean`);
      return value === 1;
    }

    // For any other value, return undefined to skip filter
    console.log(
      `[DEBUG] Transform - returning undefined (unrecognized value: ${JSON.stringify(value)}, type: ${typeof value})`,
    );
    return undefined;
  })
  selectedForNextRound?: boolean;
}
