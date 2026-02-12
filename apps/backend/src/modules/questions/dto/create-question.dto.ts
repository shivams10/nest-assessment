import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionCategory, QuestionType } from '@prisma/client';

export class QuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  optionText!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  stem!: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsEnum(QuestionCategory)
  category!: QuestionCategory;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options!: QuestionOptionDto[];
}
