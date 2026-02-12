import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { GeneratedQuestionDto } from './generate-questions.dto';

export class CommitQuestionsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one question must be approved' })
  @ArrayMaxSize(20, {
    message: 'Cannot approve more than 20 questions at once',
  })
  approved!: GeneratedQuestionDto[];
}

export class CommitQuestionsResponseDto {
  insertedCount!: number;
}
