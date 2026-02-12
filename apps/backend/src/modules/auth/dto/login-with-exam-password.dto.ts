import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginWithExamPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Exam password is required' })
  masterPassword!: string;
}
