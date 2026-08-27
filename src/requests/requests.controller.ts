import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUserPayload } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Permissions } from '../roles/permission.constants';
import { RequirePermissions } from '../roles/permissions.decorator';
import { PermissionsGuard } from '../roles/permissions.guard';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @RequirePermissions(Permissions.REQUESTS_CREATE)
  create(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: CreateSupportRequestDto,
  ) {
    return this.requestsService.create(user.id, dto);
  }

  @Get('mine')
  @RequirePermissions(Permissions.REQUESTS_VIEW_OWN)
  findMine(
    @CurrentUser() user: AuthUserPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.requestsService.findMine(user.id, query);
  }

  @Get('mine/:id')
  @RequirePermissions(Permissions.REQUESTS_VIEW_OWN)
  findMineOne(
    @CurrentUser() user: AuthUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requestsService.findMineOne(user.id, id);
  }

  @Get()
  @RequirePermissions(Permissions.REQUESTS_VIEW_ALL)
  findAll(@Query() query: PaginationQueryDto) {
    return this.requestsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permissions.REQUESTS_VIEW_ALL)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermissions(Permissions.REQUESTS_APPROVE)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateStatus(id, dto.status);
  }
}
