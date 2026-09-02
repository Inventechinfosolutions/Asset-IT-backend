import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsIn(['FULFILLED', 'REJECTED', 'RESOLVED', 'CLOSED'])
  status: 'FULFILLED' | 'REJECTED' | 'RESOLVED' | 'CLOSED';

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment must be at most 2000 characters' })
  comment?: string;
}
