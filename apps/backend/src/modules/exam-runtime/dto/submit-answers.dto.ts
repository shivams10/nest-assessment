import { IsUUID, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmitAnswerDto } from './submit-answer.dto';

export class SubmitAnswersDto {
  @IsUUID()
  submissionId!: string;

  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  @ArrayNotEmpty()
  answers!: SubmitAnswerDto[];
}
