import { Module } from '@nestjs/common';
import { PayGuestService } from './pay_guest.service';
import { PayGuestController } from './pay_guest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pay } from '../../entities/pay.entity';
import { Reservation } from '../../entities/reservation.entity';
import { ReservationGuest } from '../../entities/reservation_guest.entity';
import { PayReservationStatusService } from '../../common/service/pay_reservation_status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationGuest, Pay])],
  controllers: [PayGuestController],
  providers: [PayGuestService, PayReservationStatusService],
})
export class PayGuestModule {}
