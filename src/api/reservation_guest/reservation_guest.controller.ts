import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReservationGuestService } from './reservation_guest.service';
import { ReservationGuestRequestDto } from './dto/reservation_guest_request.dto';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from '../../common/interceptor/log.interceptor';
import { ReservationGuestCancelRequestDto } from './dto/reservation_guest_cancel_request.dto';

@ApiTags('Reservation Guest')
@Controller('reservation/guest')
export class ReservationGuestController {
  constructor(private readonly reservationService: ReservationGuestService) {}

  // 임시 점유 취소 (예약 취소) (비회원)
  @Post('cancel')
  @ApiOperation({
    summary: '특임시 점유 취소 (예약 취소) (비회원)',
    description: '결제 고유 번호를 기준으로 임시 점유 취소 (비회원)',
  })
  @ApiBody({ type: ReservationGuestCancelRequestDto, description: '비회원 공간 임시 점유 취소 요청' })
  cancelReservation(@Body() reservationGuestCancelRequestDto: ReservationGuestCancelRequestDto) {
    return this.reservationService.cancelReservation(reservationGuestCancelRequestDto);
  }

  // 특정 공간 시간 슬롯 임시 점유 (예약) (비회원)
  @Post(':id')
  @LogInterceptor(['execution-time', 'start-time'])
  @ApiOperation({ summary: '특정 공간 시간 슬롯 임시 점유 (예약) (비회원)', description: 'ID를 기준으로 특정 공간 시간 슬롯 임시 점유 (비회원)' })
  @ApiParam({ name: 'id', type: Number, description: '예약할 공간 ID' })
  @ApiBody({ type: ReservationGuestRequestDto, description: '비회원 공간 임시 점유 요청' })
  createReservation(@Param('id') spId: number, @Body() reservationGuestRequestDto: ReservationGuestRequestDto) {
    return this.reservationService.createReservation(+spId, reservationGuestRequestDto);
  }
}
