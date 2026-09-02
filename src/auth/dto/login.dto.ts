import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Alias name is required' })
  @MinLength(3)
  aliasName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  captchaId: string;

  @IsString()
  @IsNotEmpty()
  captchaAnswer: string;
}
