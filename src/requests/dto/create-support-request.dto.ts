import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

import { RequestType } from '../entities/support-request.entity';

export class CreateSupportRequestDto {
  @IsEnum(RequestType)
  requestType: RequestType;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Address/location is required' })
  @MaxLength(500, { message: 'Address/location must be at most 500 characters' })
  location: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description: string;
}
