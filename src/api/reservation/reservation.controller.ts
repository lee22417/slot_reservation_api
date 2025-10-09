import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationRequestDto } from './dto/reservation_request.dto';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LogInterceptor } from '../../common/interceptor/log.interceptor';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // 특정 공간 특정 일시 임시 점유 (예약) (비회원)
  @Post('/guest/:id')
  @LogInterceptor(['execution-time', 'start-time'])
  @ApiOperation({ summary: '특정 공간 특정 일시 임시 점유 (예약) (비회원)', description: 'ID를 기준으로 특정 공간 특정 일시 임시 점유 (비회원)' })
  @ApiParam({ name: 'id', type: Number, description: '예약할 공간 ID' })
  @ApiBody({ type: ReservationRequestDto, description: '비회원 공간 임시 점유 요청' })
  createReservation(@Param('id') spId: number, @Body() reservationRequestDto: ReservationRequestDto) {
    return this.reservationService.createReservation(+spId, reservationRequestDto);
  }
}
