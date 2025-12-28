import { IsInt, Min } from 'class-validator';

export class UpdateExamSetSectionDto {
  @IsInt()
  @Min(1)
  questionCount!: number;
}

