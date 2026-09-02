import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfile } from './entities/user-profile.entity';
import { User, UserRole } from './entities/user.entity';
import { EmploymentType } from './enums/employment-type.enum';
import {
  type PaginatedResult,
} from '../common/dto/pagination-query.dto';

const DEFAULT_EMPLOYEE_PASSWORD = 'Okay@12345';

export type PublicUser = {
  id: string;
  aliasName: string;
  role: UserRole;
  name: string;
  firstName: string;
  lastName: string | null;
  mobile: string | null;
  department: string;
  employmentType: EmploymentType;
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

  private normalizeAliasName(aliasName: string) {
    return aliasName.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private buildDisplayName(firstName: string, lastName?: string | null) {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName?.trim();
    return trimmedLast ? `${trimmedFirst} ${trimmedLast}` : trimmedFirst;
  }

  private toPublic(user: User): PublicUser {
    const firstName =
      user.profile?.firstName || user.profile?.aliasName || user.aliasName;
    const lastName = user.profile?.lastName ?? null;

    return {
      id: user.id,
      aliasName: user.aliasName,
      role: user.role,
      name: this.buildDisplayName(firstName, lastName),
      firstName,
      lastName,
      mobile: user.profile?.mobile ?? null,
      department: user.profile?.department || 'General',
      employmentType:
        user.profile?.employmentType || EmploymentType.PERMANENT,
      empNo: user.profile?.empNo ?? null,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async findByAliasName(aliasName: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { aliasName: this.normalizeAliasName(aliasName) },
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
    query: ListUsersQueryDto,
  ): Promise<PaginatedResult<PublicUser>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.role = :role', { role: UserRole.USER })
      .orderBy('user.createdAt', 'ASC');

    if (query.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.employmentType) {
      qb.andWhere('profile.employmentType = :employmentType', {
        employmentType: query.employmentType,
      });
    }

    if (search) {
      qb.andWhere(
        `(user.aliasName LIKE :search
          OR profile.aliasName LIKE :search
          OR profile.firstName LIKE :search
          OR profile.lastName LIKE :search
          OR profile.department LIKE :search
          OR profile.mobile LIKE :search
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
    const aliasName = this.normalizeAliasName(dto.aliasName);
    const firstName = dto.firstName.trim();
    const lastName = dto.lastName?.trim() || null;
    const department = dto.department.trim();
    const mobile = dto.mobile?.trim() || null;
    const empNo =
      dto.employmentType === EmploymentType.PERMANENT
        ? dto.empNo?.trim() || null
        : null;

    if (dto.employmentType === EmploymentType.PERMANENT && !empNo) {
      throw new BadRequestException(
        'Employee number is required for permanent staff',
      );
    }

    const existing = await this.findByAliasName(aliasName);
    if (existing) {
      throw new ConflictException('Alias name already registered');
    }

    const hashed = await bcrypt.hash(DEFAULT_EMPLOYEE_PASSWORD, 10);
    const user = this.usersRepository.create({
      aliasName,
      password: hashed,
      role: UserRole.USER,
      isActive: dto.isActive,
    });
    const savedUser = await this.usersRepository.save(user);

    const profile = this.profilesRepository.create({
      userId: savedUser.id,
      aliasName,
      firstName,
      lastName,
      mobile,
      department,
      employmentType: dto.employmentType,
      empNo,
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

    const aliasName = this.normalizeAliasName(dto.aliasName);
    const firstName = dto.firstName.trim();
    const lastName = dto.lastName?.trim() || null;
    const department = dto.department.trim();
    const mobile = dto.mobile?.trim() || null;
    const empNo =
      dto.employmentType === EmploymentType.PERMANENT
        ? dto.empNo?.trim() || null
        : null;

    if (dto.employmentType === EmploymentType.PERMANENT && !empNo) {
      throw new BadRequestException(
        'Employee number is required for permanent staff',
      );
    }

    if (aliasName !== user.aliasName) {
      const existing = await this.findByAliasName(aliasName);
      if (existing) {
        throw new ConflictException('Alias name already registered');
      }
    }

    user.aliasName = aliasName;
    user.isActive = dto.isActive;
    if (dto.password?.trim()) {
      user.password = await bcrypt.hash(dto.password.trim(), 10);
    }
    await this.usersRepository.save(user);

    user.profile.aliasName = aliasName;
    user.profile.firstName = firstName;
    user.profile.lastName = lastName;
    user.profile.mobile = mobile;
    user.profile.department = department;
    user.profile.employmentType = dto.employmentType;
    user.profile.empNo = empNo;
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

  async resetPassword(id: string): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user || user.role !== UserRole.USER) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(DEFAULT_EMPLOYEE_PASSWORD, 10);
    await this.usersRepository.save(user);

    const full = await this.findById(id);
    return this.toPublic(full!);
  }
}
