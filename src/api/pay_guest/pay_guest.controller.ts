import { Controller, Get, Post, Body } from '@nestjs/common';
import { PayGuestService } from './pay_guest.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PayRequestDto } from './dto/pay_request.dto';

@ApiTags('Pay Guest')
@Controller('pay/guest')
export class PayGuestController {
  constructor(private readonly payGuestService: PayGuestService) {}

  // 무료(0원)로 임시 점유 결제 (비회원)
  @Post('free')
  @ApiOperation({
    summary: '무료(0원)로 임시 점유 결제 (비회원)',
    description: '결제 고유 번호를 기준으로 무료(0원)로 임시 점유 결제 (비회원)',
  })
  @ApiBody({ type: PayRequestDto, description: '비회원 공간 결제 요청' })
  payCompleteFree(@Body() payRequestDto: PayRequestDto) {
    return this.payGuestService.payCompleteFree(payRequestDto);
  }
}
