import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateExamSetDto {
  @IsUUID()
  examId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string; // e.g. "Set A"
}
