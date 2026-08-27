import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { PermissionName } from './permission.constants';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { RolesService } from './roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionName[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new ForbiddenException('Missing role');
    }

    const granted = await this.rolesService.getPermissionNamesForRole(user.role);
    const allowed = required.every((permission) => granted.includes(permission));

    if (!allowed) {
      throw new ForbiddenException('You do not have permission for this action');
    }

    return true;
  }
}
