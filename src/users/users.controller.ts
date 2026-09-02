import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../roles/permissions.decorator';
import { PermissionsGuard } from '../roles/permissions.guard';
import { Permissions } from '../roles/permission.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserActiveDto } from './dto/update-user-active.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(Permissions.USERS_VIEW)
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @RequirePermissions(Permissions.USERS_CREATE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.USERS_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/active')
  @RequirePermissions(Permissions.USERS_ACTIVATE)
  setActive(@Param('id') id: string, @Body() dto: UpdateUserActiveDto) {
    return this.usersService.setActive(id, dto.isActive);
  }

  @Patch(':id/reset-password')
  @RequirePermissions(Permissions.USERS_UPDATE)
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}
