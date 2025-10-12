import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pay } from '../../entities/pay.entity';
import { Reservation } from '../../entities/reservation.entity';
import { ReservationGuest } from '../../entities/reservation_guest.entity';
import { PayDetail } from '../../entities/pay_detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationGuest, Pay, PayDetail])],
  controllers: [GuestController],
  providers: [GuestService],
})
export class GuestModule {}
