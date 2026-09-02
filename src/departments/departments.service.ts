import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  type PaginatedResult,
} from '../common/dto/pagination-query.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments-query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

export type PublicDepartment = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
};

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  private toPublic(department: Department): PublicDepartment {
    return {
      id: department.id,
      name: department.name,
      isActive: department.isActive,
      createdAt: department.createdAt,
    };
  }

  async findAll(
    query: ListDepartmentsQueryDto,
  ): Promise<PaginatedResult<PublicDepartment>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.departmentsRepository
      .createQueryBuilder('department')
      .orderBy('department.name', 'ASC');

    if (query.isActive !== undefined) {
      qb.andWhere('department.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (search) {
      qb.andWhere('department.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [departments, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: departments.map((d) => this.toPublic(d)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findActiveNames(): Promise<string[]> {
    const rows = await this.departmentsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
      select: ['name'],
    });
    return rows.map((row) => row.name);
  }

  async findOptions(): Promise<Array<{ name: string; isActive: boolean }>> {
    const rows = await this.departmentsRepository.find({
      order: { name: 'ASC' },
      select: ['name', 'isActive'],
    });
    return rows.map((row) => ({
      name: row.name,
      isActive: row.isActive,
    }));
  }

  async create(dto: CreateDepartmentDto): Promise<PublicDepartment> {
    const name = dto.name.trim();
    const existing = await this.departmentsRepository.findOne({
      where: { name },
    });
    if (existing) {
      throw new ConflictException('Department name already exists');
    }

    const department = this.departmentsRepository.create({
      name,
      isActive: dto.isActive,
    });
    const saved = await this.departmentsRepository.save(department);
    return this.toPublic(saved);
  }

  async update(
    id: number,
    dto: UpdateDepartmentDto,
  ): Promise<PublicDepartment> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const name = dto.name.trim();
    if (name !== department.name) {
      const existing = await this.departmentsRepository.findOne({
        where: { name },
      });
      if (existing) {
        throw new ConflictException('Department name already exists');
      }
    }

    department.name = name;
    department.isActive = dto.isActive;
    const saved = await this.departmentsRepository.save(department);
    return this.toPublic(saved);
  }
}
