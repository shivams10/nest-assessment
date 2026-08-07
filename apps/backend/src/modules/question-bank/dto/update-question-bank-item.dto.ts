import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDifficulty } from '@prisma/client';
import {
  QuestionBankOptionDto,
  QuestionBankTestCaseDto,
} from './create-question-bank-item.dto';

// A question's `type` is fixed after creation; delete and recreate to change it.
export class UpdateQuestionBankItemDto {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prompt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionBankOptionDto)
  options?: QuestionBankOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionBankTestCaseDto)
  testCases?: QuestionBankTestCaseDto[];
}
