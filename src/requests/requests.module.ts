import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesModule } from '../roles/roles.module';
import { SupportRequest } from './entities/support-request.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportRequest]), RolesModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
