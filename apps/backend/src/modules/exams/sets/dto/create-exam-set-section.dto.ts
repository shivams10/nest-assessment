import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { SectionType } from '@prisma/client';

export class CreateExamSetSectionDto {
  @IsUUID()
  examSetId!: string;

  @IsEnum(SectionType)
  sectionType!: SectionType; // aptitude | technical

  @IsInt()
  @Min(1)
  questionCount!: number;
}
