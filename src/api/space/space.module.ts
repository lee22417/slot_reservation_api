import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';
import { Space } from '../../entities/store_space.entity';
import { Reservation } from '../../entities/reservation.entity';
import { Store } from '../../entities/store.entity';
import { StoreHoliday } from '../../entities/store_holiday.entity';
import { SpaceStatusService } from '../../common/service/space_status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreHoliday, Space, SpaceOption, SpaceSchedule, Reservation])],
  controllers: [SpaceController],
  providers: [SpaceService, SpaceStatusService],
})
export class SpaceModule {}
