import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesModule } from '../roles/roles.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { Asset } from './entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset]), RolesModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
