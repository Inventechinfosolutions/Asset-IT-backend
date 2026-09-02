import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Alias name is required' })
  @MinLength(3, { message: 'Alias name must be at least 3 characters' })
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._\- ]+$/, {
    message:
      'Alias name may only contain letters, numbers, spaces, dots, underscores, and hyphens',
  })
  aliasName: string;

  @IsString()
  @IsNotEmpty({ message: 'Department is required' })
  @MaxLength(100)
  department: string;

  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile number must be a valid 10-digit number',
  })
  mobile?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsBoolean()
  isActive: boolean;
}
