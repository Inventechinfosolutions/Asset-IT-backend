import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { AssetType } from '../../assets/enums/asset-type.enum';
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

  @ValidateIf((o: CreateSupportRequestDto) => o.requestType === RequestType.ASSET)
  @IsArray({ message: 'Select at least one asset' })
  @ArrayMinSize(1, { message: 'Select at least one asset' })
  @ArrayUnique()
  @IsEnum(AssetType, {
    each: true,
    message: 'One or more selected assets are invalid',
  })
  selectedAssets?: AssetType[];
}
