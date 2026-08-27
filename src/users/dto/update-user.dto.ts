import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._\- ]+$/, {
    message:
      'Username may only contain letters, numbers, spaces, dots, underscores, and hyphens',
  })
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsBoolean()
  isPermanent: boolean;

  @ValidateIf((o: UpdateUserDto) => o.isPermanent === true)
  @IsString()
  @IsNotEmpty({ message: 'Employee number is required for permanent staff' })
  empNo?: string;

  @IsBoolean()
  isActive: boolean;
}
