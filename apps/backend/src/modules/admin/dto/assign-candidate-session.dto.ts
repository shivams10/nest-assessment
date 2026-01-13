import { IsString, IsOptional, ValidateIf } from 'class-validator';

export class AssignCandidateSessionDto {
  @ValidateIf((o) => o.collegeSessionId !== null)
  @IsOptional()
  @IsString()
  collegeSessionId?: string | null;
}

export class BulkAssignCandidatesDto {
  @IsString({ each: true })
  userIds: string[];

  @ValidateIf((o) => o.collegeSessionId !== null)
  @IsOptional()
  @IsString()
  collegeSessionId?: string | null;
}

