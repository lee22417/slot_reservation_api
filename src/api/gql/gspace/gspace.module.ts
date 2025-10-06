import { Module } from '@nestjs/common';
import { GspaceService } from './gspace.service';
import { GspaceResolver } from './gspace.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from '../../../entities/store_space.entity';
import { SpaceOption } from '../../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../../entities/store_space_schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Space, SpaceOption, SpaceSchedule])],
  providers: [GspaceResolver, GspaceService],
})
export class GspaceModule {}
