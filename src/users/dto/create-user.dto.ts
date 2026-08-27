import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._\- ]+$/, {
    message:
      'Username may only contain letters, numbers, spaces, dots, underscores, and hyphens',
  })
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  /** true = permanent (empNo required), false = contract (no empNo) */
  @IsBoolean()
  isPermanent: boolean;

  @ValidateIf((o: CreateUserDto) => o.isPermanent === true)
  @IsString()
  @IsNotEmpty({ message: 'Employee number is required for permanent staff' })
  empNo?: string;

  @IsBoolean()
  isActive: boolean;
}
