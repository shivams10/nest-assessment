import { IsUUID } from 'class-validator';

export class StartExamDto {
  @IsUUID()
  examId!: string;
}
