import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  captchaId: string;

  @IsString()
  @MinLength(4)
  @MaxLength(8)
  captchaAnswer: string;
}
