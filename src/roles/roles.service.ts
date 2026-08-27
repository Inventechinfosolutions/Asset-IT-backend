import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionsRepository: Repository<RolePermission>,
  ) {}

  findAllRoles() {
    return this.rolesRepository.find({
      order: { name: 'ASC' },
    });
  }

  findAllPermissions() {
    return this.permissionsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getPermissionNamesForRole(roleName: string) {
    const rows = await this.rolePermissionsRepository.find({
      where: { role: { name: roleName } },
      relations: ['permission', 'role'],
    });

    return rows.map((row) => row.permission.name);
  }
}
