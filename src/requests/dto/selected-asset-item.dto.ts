import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { AssetType } from '../../assets/enums/asset-type.enum';

export class SelectedAssetItemDto {
  @IsEnum(AssetType, { message: 'Invalid asset type' })
  assetType: AssetType;

  @IsString()
  @IsNotEmpty({ message: 'Asset name is required' })
  @MaxLength(100, { message: 'Asset name must be at most 100 characters' })
  name: string;

  @Type(() => Number)
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(999, { message: 'Quantity must be at most 999' })
  quantity: number;
}
