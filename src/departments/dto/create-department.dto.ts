import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Department name is required' })
  @MaxLength(100)
  name: string;

  @IsBoolean()
  isActive: boolean;
}
