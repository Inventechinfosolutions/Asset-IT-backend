import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../users/users.service';

export type JwtPayload = {
  sub: string;
  aliasName: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'admin-users-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const firstName =
      user.profile?.firstName || user.profile?.aliasName || user.aliasName;
    const lastName = user.profile?.lastName ?? null;
    const displayName = lastName
      ? `${firstName} ${lastName}`
      : firstName;

    return {
      id: user.id,
      aliasName: user.aliasName,
      role: user.role,
      name: displayName,
    };
  }
}
