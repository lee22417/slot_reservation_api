import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Space } from '../../entities/store_space.entity';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { SpaceStatusService } from '../../common/service/space_status.service';
import { PaymentIdService } from '../../common/service/payment_id.service';
import { Store } from '../../entities/store.entity';
import { StoreHoliday } from '../../entities/store_holiday.entity';
import { Pay } from '../../entities/pay.entity';
import { SpaceSlotService } from '../../common/service/space_slot.service';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';
import { LogPinoService } from '../../common/service/log_pino.service';
import { ReservationGuest } from '../../entities/reservation_guest.entity';
import { ReservationOption } from '../../entities/reservation_option.entity';
import { PayDetail } from '../../entities/pay_detail.entity';
import { StorePaySetting } from '../../entities/store_pay_setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Store,
      StoreHoliday,
      StorePaySetting,
      Space,
      SpaceOption,
      SpaceSchedule,
      Reservation,
      ReservationGuest,
      ReservationOption,
      Pay,
      PayDetail,
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, SpaceSlotService, SpaceStatusService, PaymentIdService, LogPinoService],
})
export class ReservationModule {}
