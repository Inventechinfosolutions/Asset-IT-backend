import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { EmploymentType } from '../enums/employment-type.enum';

export class CreateUserDto {
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

  @IsEnum(EmploymentType, { message: 'Select Permanent or Contract' })
  employmentType: EmploymentType;

  @ValidateIf((o: CreateUserDto) => o.employmentType === EmploymentType.PERMANENT)
  @IsString()
  @IsNotEmpty({ message: 'Employee number is required for permanent staff' })
  @MaxLength(50, { message: 'Employee number must be at most 50 characters' })
  empNo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile number must be a valid 10-digit number',
  })
  mobile?: string;

  @IsBoolean()
  isActive: boolean;
}
