import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const UPDATEABLE_REQUEST_STATUSES = [
  'IN_PROGRESS',
  'PENDING_USER',
  'PENDING_VENDOR',
  'ON_HOLD',
  'FULFILLED',
  'REJECTED',
  'RESOLVED',
  'CLOSED',
] as const;

export type UpdateableRequestStatus =
  (typeof UPDATEABLE_REQUEST_STATUSES)[number];

export class UpdateRequestStatusDto {
  @IsIn(UPDATEABLE_REQUEST_STATUSES)
  status: UpdateableRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment must be at most 2000 characters' })
  comment?: string;
}
