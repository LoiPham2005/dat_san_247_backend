import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  email: string; // Có thể là username hoặc email

  @IsNotEmpty()
  @IsString()
  password: string;
}