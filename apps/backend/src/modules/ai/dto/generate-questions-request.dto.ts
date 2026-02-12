import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateQuestionsRequestDto {
  @IsEnum(['aptitude', 'technical'])
  category!: 'aptitude' | 'technical';

  @IsEnum(['single_select', 'multi_select'])
  type!: 'single_select' | 'multi_select';

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  count!: number;
}
