import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt, randomUUID } from 'node:crypto';

import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

const CAPTCHA_TTL_SECONDS = 300;
const CAPTCHA_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async createCaptcha() {
    const captchaId = randomUUID();
    const answer = this.createCaptchaAnswer();
    await this.redisService.set(
      `captcha:${captchaId}`,
      answer,
      CAPTCHA_TTL_SECONDS,
    );

    return {
      captchaId,
      image: this.createCaptchaSvg(answer),
      expiresIn: CAPTCHA_TTL_SECONDS,
    };
  }

  async login(dto: LoginDto) {
    await this.verifyCaptcha(dto.captchaId, dto.captchaAnswer);

    const user = await this.usersService.findByAliasName(dto.aliasName);
    if (!user) {
      throw new UnauthorizedException('Invalid alias name or password');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid alias name or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.buildAuthResponse(user);
  }

  private async verifyCaptcha(captchaId: string, captchaAnswer: string) {
    const key = `captcha:${captchaId}`;
    const expectedAnswer = await this.redisService.get(key);
    await this.redisService.del(key);

    if (
      !expectedAnswer ||
      expectedAnswer !== captchaAnswer.trim().toUpperCase()
    ) {
      throw new UnauthorizedException('Invalid or expired CAPTCHA');
    }
  }

  private createCaptchaAnswer(): string {
    const availableCharacters = CAPTCHA_CHARACTERS.split('');
    const answer: string[] = [];

    while (answer.length < 5) {
      const characterIndex = randomInt(availableCharacters.length);
      answer.push(availableCharacters.splice(characterIndex, 1)[0]);
    }

    return answer.join('');
  }

  private createCaptchaSvg(answer: string): string {
    const text = answer
      .split('')
      .map(
        (character, index) =>
          `<text x="${34 + index * 28}" y="${48 + (index % 2) * 4}" transform="rotate(${index % 2 === 0 ? -8 : 7} ${34 + index * 28} 48)">${character}</text>`,
      )
      .join('');
    const lines = Array.from(
      { length: 5 },
      (_, index) =>
        `<path d="M${10 + index * 20} ${12 + (index % 3) * 15} Q${45 + index * 18} ${58 - (index % 2) * 18} ${150 - index * 11} ${18 + (index % 4) * 10}" />`,
    ).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="68" viewBox="0 0 180 68"><rect width="180" height="68" rx="10" fill="#eff6ff"/><g fill="none" stroke="#93c5fd" stroke-width="1.5" opacity=".8">${lines}</g><g fill="#123c78" font-family="Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="2">${text}</g></svg>`;
  }

  private async buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      aliasName: user.aliasName,
      role: user.role,
    };

    const firstName =
      user.profile?.firstName || user.profile?.aliasName || user.aliasName;
    const lastName = user.profile?.lastName ?? null;
    const displayName = lastName
      ? `${firstName} ${lastName}`
      : firstName;

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: displayName,
        aliasName: user.aliasName,
        role: user.role,
        mustChangePassword: Boolean(user.mustChangePassword),
      },
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    return this.usersService.changePassword(
      userId,
      oldPassword,
      newPassword,
      confirmNewPassword,
    );
  }
}
