import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../../entities/store.entity';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';
import { Space } from '../../entities/store_space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Space, SpaceOption, SpaceSchedule])],
  controllers: [SpaceController],
  providers: [SpaceService],
})
export class SpaceModule {}
