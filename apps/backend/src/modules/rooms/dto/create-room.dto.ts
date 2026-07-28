import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  resourceEmail!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;
}
