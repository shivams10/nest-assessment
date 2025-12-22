import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCandidateDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsUUID()
  collegeSessionId!: string;
}
