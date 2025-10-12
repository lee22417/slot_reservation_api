import { Controller, Get, Post, Body } from '@nestjs/common';
import { PayGuestService } from './pay_guest.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PayRequestDto } from './dto/pay_request.dto';

@ApiTags('Pay Guest')
@Controller('pay/guest')
export class PayGuestController {
  constructor(private readonly payGuestService: PayGuestService) {}

  // 무료(0원)로 임시 점유 결제 완료 (비회원)
  @Post('free')
  @ApiOperation({
    summary: '무료(0원)로 임시 점유 결제 완료 (비회원)',
    description: '결제 고유 번호를 기준으로 무료(0원)로 임시 점유 결제 완료 (비회원)',
  })
  @ApiBody({ type: PayRequestDto, description: '비회원 공간 무료 결제 요청' })
  payFreeComplete(@Body() payRequestDto: PayRequestDto) {
    return this.payGuestService.payFreeComplete(payRequestDto);
  }

  // 무료(0원)로 결제 완료한 예약 취소 (비회원)
  @Post('free/cancel')
  @ApiOperation({
    summary: '무료(0원)로 결제 완료한 예약 취소 (비회원)',
    description: '결제 고유 번호를 기준으로 무료(0원)로 결제 완료한 예약 취소 (비회원)',
  })
  @ApiBody({ type: PayRequestDto, description: '비회원 공간 무료 결제 취소 요청' })
  payFreeCancel(@Body() payRequestDto: PayRequestDto) {
    return this.payGuestService.payFreeCancel(payRequestDto);
  }

  // 현금 결제시 임시 점유를 결제 대기 (비회원)
  @Post('cash/pending')
  @ApiOperation({
    summary: '현금 결제시 임시 점유를 결제 대기 (비회원)',
    description: '결제 고유 번호를 기준으로 현금 결제 임시 점유를 결제 대기 (비회원)',
  })
  @ApiBody({ type: PayRequestDto, description: '비회원 공간 현금 결제 대기 요청' })
  payCashPending(@Body() payRequestDto: PayRequestDto) {
    return this.payGuestService.payCashPending(payRequestDto);
  }

  // 현금 결제 대기 취소 (비회원)
  @Post('cash/pending/cancel')
  @ApiOperation({
    summary: '현금 결제 대기 취소 (비회원)',
    description: '결제 고유 번호를 기준으로 현금 결제 대기 취소 (비회원)',
  })
  @ApiBody({ type: PayRequestDto, description: '비회원 공간 현금 결제 대기 취소 요청' })
  payCashPendingCancel(@Body() payRequestDto: PayRequestDto) {
    return this.payGuestService.payCashPendingCancel(payRequestDto);
  }
}
