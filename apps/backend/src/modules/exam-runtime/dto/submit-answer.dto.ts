import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsArray()
  @ArrayNotEmpty()
  selectedOptionIds!: string[];
}
