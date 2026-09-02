import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ZoneName } from '../../zones/enums/zone-name.enum';
import { RequestType } from '../entities/support-request.entity';
import { SelectedAssetItemDto } from './selected-asset-item.dto';

export class CreateSupportRequestDto {
  @IsEnum(RequestType)
  requestType: RequestType;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title: string;

  @IsEnum(ZoneName, { message: 'Select a valid zone' })
  zone: ZoneName;

  @IsString()
  @IsNotEmpty({ message: 'Address/location is required' })
  @MaxLength(500, { message: 'Address/location must be at most 500 characters' })
  location: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description?: string;

  @ValidateIf((o: CreateSupportRequestDto) => o.requestType === RequestType.ASSET)
  @IsArray({ message: 'Select at least one asset' })
  @ArrayMinSize(1, { message: 'Select at least one asset' })
  @ValidateNested({ each: true })
  @Type(() => SelectedAssetItemDto)
  selectedAssets?: SelectedAssetItemDto[];
}
