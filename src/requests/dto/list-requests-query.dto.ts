import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { RequestType } from '../entities/support-request.entity';

export class ListRequestsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RequestType, { message: 'requestType must be ASSET or IT_SUPPORT' })
  requestType?: RequestType;
}
