import { Injectable } from '@nestjs/common';

import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    const redis = await this.redisService.ping();
    return {
      status: 'ok',
      redis,
    };
  }
}
