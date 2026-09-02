import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { EmploymentType } from '../enums/employment-type.enum';

export class ListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(EmploymentType, {
    message: 'employmentType must be Permanent or Contract',
  })
  employmentType?: EmploymentType;
}
