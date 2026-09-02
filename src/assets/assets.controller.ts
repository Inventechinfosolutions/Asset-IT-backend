import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../roles/permission.constants';
import { RequirePermissions } from '../roles/permissions.decorator';
import { PermissionsGuard } from '../roles/permissions.guard';
import { AssetsService } from './assets.service';

@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('active')
  @RequirePermissions(Permissions.REQUESTS_CREATE)
  findActive() {
    return this.assetsService.findActiveNames();
  }
}
