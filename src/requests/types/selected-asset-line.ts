import { AssetType } from '../../assets/enums/asset-type.enum';

export interface SelectedAssetLine {
  assetType: AssetType;
  name: string;
  quantity: number;
}
