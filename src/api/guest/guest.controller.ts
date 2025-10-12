import { Controller, Post, Body } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestRequestDto } from './dto/guest_request.dto';
import { instanceToPlain } from 'class-transformer';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  // 비회원 공간 예약 조회
  @Post()
  @ApiOperation({
    summary: '비회원 공간 예약 조회',
    description: '결제 고유 번호 뒷6자리를 기준으로 비회원 공간 예약 조회',
  })
  @ApiBody({ type: GuestRequestDto, description: '비회원 공간 조회 요청' })
  async getGuestReservation(@Body() guestRequestDto: GuestRequestDto) {
    const result = await this.guestService.getGuestReservation(guestRequestDto);
    return instanceToPlain(result); // Expose() 필드 포함되도록 변환
  }
}
