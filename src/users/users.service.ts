import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Not, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfile } from './entities/user-profile.entity';
import {
  EmploymentType,
  User,
  UserRole,
} from './entities/user.entity';
import {
  PaginationQueryDto,
  type PaginatedResult,
} from '../common/dto/pagination-query.dto';

export type PublicUser = {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  employmentType: EmploymentType | null;
  empNo: string | null;
  isActive: boolean;
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profilesRepository: Repository<UserProfile>,
  ) {}

  private normalizeUsername(username: string) {
    return username.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private toPublic(user: User): PublicUser {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.profile?.name || user.username,
      employmentType: user.profile?.employmentType ?? null,
      empNo: user.profile?.empNo ?? null,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username: this.normalizeUsername(username) },
      relations: ['profile'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PublicUser>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.role = :role', { role: UserRole.USER })
      .orderBy('user.createdAt', 'ASC');

    if (search) {
      qb.andWhere(
        `(user.username LIKE :search
          OR profile.name LIKE :search
          OR profile.empNo LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [users, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map((u) => this.toPublic(u)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    if (dto.isPermanent && !dto.empNo?.trim()) {
      throw new BadRequestException(
        'Employee number is required for permanent staff',
      );
    }

    const username = this.normalizeUsername(dto.username);
    const existing = await this.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already registered');
    }

    if (dto.isPermanent && dto.empNo) {
      const empExists = await this.profilesRepository.findOne({
        where: { empNo: dto.empNo.trim() },
      });
      if (empExists) {
        throw new ConflictException('Employee number already exists');
      }
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      username,
      password: hashed,
      role: UserRole.USER,
      isActive: dto.isActive,
    });
    const savedUser = await this.usersRepository.save(user);

    const profile = this.profilesRepository.create({
      userId: savedUser.id,
      name: username,
      employmentType: dto.isPermanent
        ? EmploymentType.PERMANENT
        : EmploymentType.CONTRACT,
      empNo: dto.isPermanent ? dto.empNo!.trim() : null,
    });
    await this.profilesRepository.save(profile);

    const full = await this.findById(savedUser.id);
    return this.toPublic(full!);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user || user.role !== UserRole.USER) {
      throw new NotFoundException('User not found');
    }
    if (!user.profile) {
      throw new NotFoundException('User profile not found');
    }

    if (dto.isPermanent && !dto.empNo?.trim()) {
      throw new BadRequestException(
        'Employee number is required for permanent staff',
      );
    }

    const username = this.normalizeUsername(dto.username);
    if (username !== user.username) {
      const existing = await this.findByUsername(username);
      if (existing) {
        throw new ConflictException('Username already registered');
      }
    }

    if (dto.isPermanent && dto.empNo) {
      const empNo = dto.empNo.trim();
      const empExists = await this.profilesRepository.findOne({
        where: { empNo, userId: Not(id) },
      });
      if (empExists) {
        throw new ConflictException('Employee number already exists');
      }
    }

    user.username = username;
    user.isActive = dto.isActive;
    if (dto.password?.trim()) {
      user.password = await bcrypt.hash(dto.password.trim(), 10);
    }
    await this.usersRepository.save(user);

    user.profile.name = username;
    user.profile.employmentType = dto.isPermanent
      ? EmploymentType.PERMANENT
      : EmploymentType.CONTRACT;
    user.profile.empNo = dto.isPermanent ? dto.empNo!.trim() : null;
    await this.profilesRepository.save(user.profile);

    const full = await this.findById(id);
    return this.toPublic(full!);
  }

  async setActive(id: string, isActive: boolean): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user || user.role !== UserRole.USER) {
      throw new NotFoundException('User not found');
    }

    user.isActive = isActive;
    await this.usersRepository.save(user);

    const full = await this.findById(id);
    return this.toPublic(full!);
  }
}
