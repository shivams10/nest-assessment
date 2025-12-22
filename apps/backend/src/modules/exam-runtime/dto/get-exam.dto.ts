import { IsUUID } from 'class-validator';

export class GetExamDto {
  @IsUUID()
  submissionId!: string;
}
