import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Asset } from './entities/asset.entity';
import { AssetType } from './enums/asset-type.enum';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
  ) {}

  async findActiveNames(): Promise<AssetType[]> {
    const rows = await this.assetsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
      select: ['name'],
    });
    return rows.map((row) => row.name);
  }

  async assertActiveNames(names: string[]): Promise<AssetType[]> {
    const uniqueNames = Array.from(
      new Set(names.map((name) => name.trim()).filter(Boolean)),
    ) as AssetType[];

    if (uniqueNames.length === 0) {
      return [];
    }

    const rows = await this.assetsRepository
      .createQueryBuilder('asset')
      .where('asset.name IN (:...names)', { names: uniqueNames })
      .andWhere('asset.isActive = :isActive', { isActive: true })
      .getMany();

    const found = new Set(rows.map((row) => row.name));
    const missing = uniqueNames.filter((name) => !found.has(name));
    if (missing.length > 0) {
      throw new Error(`Invalid or inactive assets: ${missing.join(', ')}`);
    }

    return uniqueNames;
  }
}
