import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Zone } from './entities/zone.entity';
import { ZoneName } from './enums/zone-name.enum';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly zonesRepository: Repository<Zone>,
  ) {}

  async findNames(): Promise<ZoneName[]> {
    const rows = await this.zonesRepository.find({
      order: { name: 'ASC' },
      select: ['name'],
    });
    return rows.map((row) => row.name);
  }

  async assertNames(names: string[]): Promise<ZoneName[]> {
    const uniqueNames = Array.from(
      new Set(names.map((name) => name.trim()).filter(Boolean)),
    ) as ZoneName[];

    if (uniqueNames.length === 0) {
      return [];
    }

    const rows = await this.zonesRepository
      .createQueryBuilder('zone')
      .where('zone.name IN (:...names)', { names: uniqueNames })
      .getMany();

    const found = new Set(rows.map((row) => row.name));
    const missing = uniqueNames.filter((name) => !found.has(name));
    if (missing.length > 0) {
      throw new Error(`Invalid zones: ${missing.join(', ')}`);
    }

    return uniqueNames;
  }
}
