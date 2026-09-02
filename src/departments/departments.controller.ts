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

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../roles/permission.constants';
import { RequirePermissions } from '../roles/permissions.decorator';
import { PermissionsGuard } from '../roles/permissions.guard';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments-query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @RequirePermissions(Permissions.DEPARTMENTS_VIEW)
  findAll(@Query() query: ListDepartmentsQueryDto) {
    return this.departmentsService.findAll(query);
  }

  @Get('active')
  @RequirePermissions(Permissions.DEPARTMENTS_VIEW)
  findActive() {
    return this.departmentsService.findActiveNames();
  }

  @Get('options')
  @RequirePermissions(Permissions.DEPARTMENTS_VIEW)
  findOptions() {
    return this.departmentsService.findOptions();
  }

  @Post()
  @RequirePermissions(Permissions.DEPARTMENTS_CREATE)
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.DEPARTMENTS_UPDATE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, dto);
  }
}
