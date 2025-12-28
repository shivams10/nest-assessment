import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionCategory, QuestionType } from '@prisma/client';

export class UpdateQuestionOptionDto {
  @IsString()
  @IsOptional()
  optionText?: string;

  @IsOptional()
  isCorrect?: boolean;
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  stem?: string;

  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @IsEnum(QuestionCategory)
  @IsOptional()
  category?: QuestionCategory;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionOptionDto)
  @IsOptional()
  options?: UpdateQuestionOptionDto[];
}

