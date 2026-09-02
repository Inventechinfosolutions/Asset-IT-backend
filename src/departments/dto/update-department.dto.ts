import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Department name is required' })
  @MaxLength(100)
  name: string;

  @IsBoolean()
  isActive: boolean;
}
