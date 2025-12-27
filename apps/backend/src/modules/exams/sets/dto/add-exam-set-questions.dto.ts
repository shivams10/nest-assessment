import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class AddExamSetQuestionsDto {
  @IsUUID()
  examSetSectionId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  questionIds!: string[];
}
