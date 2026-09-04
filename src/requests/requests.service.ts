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
import { NotificationsService } from '../notifications/notifications.service';
import { AssetsService } from '../assets/assets.service';
import { ZoneName } from '../zones/enums/zone-name.enum';
import { ZonesService } from '../zones/zones.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import type { UpdateableRequestStatus } from './dto/update-request-status.dto';
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
    private readonly notificationsService: NotificationsService,
    private readonly assetsService: AssetsService,
    private readonly zonesService: ZonesService,
  ) {}

  private formatRequestCode(id: number): string {
    return `REQ-${String(id).padStart(2, '0')}`;
  }

  private mapRow(row: SupportRequest) {
    return {
      ...row,
      requestCode: row.requestCode || this.formatRequestCode(row.id),
      user: row.user
        ? {
            id: row.user.id,
            name: row.user.profile
              ? [row.user.profile.firstName, row.user.profile.lastName]
                  .filter(Boolean)
                  .join(' ')
              : '',
            aliasName: row.user.aliasName,
            department: row.user.profile?.department || '',
            empNo: row.user.profile?.empNo || '',
          }
        : null,
    };
  }

  async create(userId: string, dto: CreateSupportRequestDto) {
    let selectedAssets: Awaited<
      ReturnType<AssetsService['assertSelectedAssets']>
    > | null = null;
    let zone: ZoneName;

    try {
      const validated = await this.zonesService.assertNames([dto.zone]);
      zone = validated[0];
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Invalid zone selected',
      );
    }

    if (!zone) {
      throw new BadRequestException('Select a valid zone');
    }

    if (dto.requestType === RequestType.ASSET) {
      try {
        selectedAssets = await this.assetsService.assertSelectedAssets(
          dto.selectedAssets ?? [],
        );
      } catch (err) {
        throw new BadRequestException(
          err instanceof Error ? err.message : 'Invalid assets selected',
        );
      }

      if (!selectedAssets.length) {
        throw new BadRequestException('Select at least one asset');
      }
    }

    const request = this.requestsRepository.create({
      userId,
      requestType: dto.requestType,
      status: RequestStatus.SUBMITTED,
      title: dto.title.trim(),
      zone,
      location: dto.location.trim(),
      description: (dto.description || '').trim(),
      selectedAssets,
    });

    const savedRequest = await this.requestsRepository.save(request);
    savedRequest.requestCode = this.formatRequestCode(savedRequest.id);
    await this.requestsRepository.save(savedRequest);

    await this.notificationsService.notifyRequestCreated(
      savedRequest.id,
      savedRequest.title,
      userId,
    );

    return savedRequest;
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
      .orderBy('request.id', 'DESC');

    if (search) {
      qb.andWhere(
        '(request.title LIKE :search OR request.location LIKE :search OR request.description LIKE :search OR request.requestType LIKE :search OR request.status LIKE :search OR request.requestCode LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map((row) => ({
        ...row,
        requestCode: row.requestCode || this.formatRequestCode(row.id),
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findAll(
    query: ListRequestsQueryDto,
  ): Promise<PaginatedResult<ReturnType<RequestsService['mapRow']>>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.requestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .orderBy('request.id', 'DESC');

    if (query.requestType) {
      qb.andWhere('request.requestType = :requestType', {
        requestType: query.requestType,
      });
    }

    if (search) {
      qb.andWhere(
        `(request.title LIKE :search
          OR request.location LIKE :search
          OR request.description LIKE :search
          OR request.requestType LIKE :search
          OR request.status LIKE :search
          OR request.requestCode LIKE :search
          OR user.aliasName LIKE :search
          OR profile.aliasName LIKE :search
          OR profile.department LIKE :search
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
    status: UpdateableRequestStatus,
    comment: string | undefined,
    senderId: string,
  ) {
    const request = await this.requestsRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const openStatuses: RequestStatus[] = [
      RequestStatus.SUBMITTED,
      RequestStatus.IN_PROGRESS,
      RequestStatus.PENDING_USER,
      RequestStatus.PENDING_VENDOR,
      RequestStatus.ON_HOLD,
    ];

    if (!openStatuses.includes(request.status)) {
      throw new BadRequestException('Request status has already been updated');
    }

    const workflowStatuses = [
      'IN_PROGRESS',
      'PENDING_USER',
      'PENDING_VENDOR',
      'ON_HOLD',
    ] as const;

    const isWorkflowStatus = (
      workflowStatuses as readonly string[]
    ).includes(status);

    if (request.requestType === RequestType.ASSET) {
      if (
        !isWorkflowStatus &&
        status !== 'FULFILLED' &&
        status !== 'REJECTED'
      ) {
        throw new BadRequestException(
          'Asset requests can only be Fulfilled, Rejected, or set to a workflow status',
        );
      }
    } else if (
      !isWorkflowStatus &&
      status !== 'RESOLVED' &&
      status !== 'CLOSED'
    ) {
      throw new BadRequestException(
        'IT support tickets can only be Resolved, Closed, or set to a workflow status',
      );
    }

    if (status === request.status) {
      throw new BadRequestException('Select a different status');
    }

    const trimmedComment = (comment || '').trim();

    request.status = status as RequestStatus;
    request.adminComment = trimmedComment || null;
    const savedRequest = await this.requestsRepository.save(request);
    await this.notificationsService.clearRequestCreatedNotification(
      savedRequest.id,
    );
    await this.notificationsService.notifyRequestStatusChanged(
      savedRequest.id,
      savedRequest.title,
      savedRequest.status,
      savedRequest.userId,
      senderId,
    );

    return savedRequest;
  }
}
