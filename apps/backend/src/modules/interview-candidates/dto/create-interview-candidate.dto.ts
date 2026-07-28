import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInterviewCandidateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  roleApplyingFor!: string;

  @IsOptional()
  @IsString()
  referredBy?: string;
}
