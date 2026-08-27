import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PaginationQueryDto,
  type PaginatedResult,
} from '../common/dto/pagination-query.dto';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import {
  RequestStatus,
  RequestType,
  SupportRequest,
} from './entities/support-request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(SupportRequest)
    private readonly requestsRepository: Repository<SupportRequest>,
  ) {}

  private mapRow(row: SupportRequest) {
    return {
      ...row,
      user: row.user
        ? {
            id: row.user.id,
            name: row.user.profile?.name ?? '',
            username: row.user.username,
          }
        : null,
    };
  }

  async create(userId: string, dto: CreateSupportRequestDto) {
    const request = this.requestsRepository.create({
      userId,
      requestType: dto.requestType,
      status: RequestStatus.SUBMITTED,
      title: dto.title.trim(),
      location: dto.location.trim(),
      description: dto.description.trim(),
    });

    return this.requestsRepository.save(request);
  }

  async findMine(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<SupportRequest>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.requestsRepository
      .createQueryBuilder('request')
      .where('request.userId = :userId', { userId })
      .orderBy('request.createdAt', 'ASC');

    if (search) {
      qb.andWhere(
        '(request.title LIKE :search OR request.location LIKE :search OR request.description LIKE :search OR request.requestType LIKE :search OR request.status LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ReturnType<RequestsService['mapRow']>>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.requestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .orderBy('request.createdAt', 'ASC');

    if (search) {
      qb.andWhere(
        `(request.title LIKE :search
          OR request.location LIKE :search
          OR request.description LIKE :search
          OR request.requestType LIKE :search
          OR request.status LIKE :search
          OR user.username LIKE :search
          OR profile.name LIKE :search
          OR CAST(request.id AS CHAR) LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: rows.map((row) => this.mapRow(row)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number) {
    const row = await this.requestsRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile'],
    });
    if (!row) {
      throw new NotFoundException('Request not found');
    }

    return this.mapRow(row);
  }

  async findMineOne(userId: string, id: number) {
    const row = await this.requestsRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile'],
    });
    if (!row) {
      throw new NotFoundException('Request not found');
    }
    if (row.userId !== userId) {
      throw new ForbiddenException('You can only view your own requests');
    }

    return this.mapRow(row);
  }

  async updateStatus(
    id: number,
    status: 'FULFILLED' | 'REJECTED' | 'RESOLVED' | 'CLOSED',
  ) {
    const request = await this.requestsRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== RequestStatus.SUBMITTED) {
      throw new BadRequestException('Request status has already been updated');
    }

    if (request.requestType === RequestType.ASSET) {
      if (status !== 'FULFILLED' && status !== 'REJECTED') {
        throw new BadRequestException(
          'Asset requests can only be Fulfilled or Rejected',
        );
      }
    } else if (status !== 'RESOLVED' && status !== 'CLOSED') {
      throw new BadRequestException(
        'IT support tickets can only be Resolved or Closed',
      );
    }

    request.status = status as RequestStatus;
    return this.requestsRepository.save(request);
  }
}
