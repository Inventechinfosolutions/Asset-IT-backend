import { IsIn } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsIn(['FULFILLED', 'REJECTED', 'RESOLVED', 'CLOSED'])
  status: 'FULFILLED' | 'REJECTED' | 'RESOLVED' | 'CLOSED';
}
