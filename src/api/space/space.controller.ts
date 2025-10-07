import { Controller, Get, Param, Query } from '@nestjs/common';
import { SpaceService } from './space.service';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  // 특정 공간 모든 정보 조회
  @Get(':id')
  @ApiOperation({ summary: '특정 공간 모든 정보 조회', description: 'ID를 기준으로 특정 공간의 모든 정보 조회' })
  @ApiParam({ name: 'id', type: Number, description: '조회할 공간 ID' })
  @ApiQuery({ name: 'status', required: false, type: Number, description: '공간 옵션 사용 여부로 필터링 (0:미사용,1:사용)' })
  findOneSpace(@Param('id') st_id: number, @Query('status') option_status?: string) {
    let filterStatus: number | undefined;
    if (option_status === '0') {
      filterStatus = 0;
    } else if (option_status === '1') {
      filterStatus = 1;
    }

    return this.spaceService.findOneSpace(+st_id, filterStatus);
  }

  // 특정 공간 특정 일자 시간 슬롯 및 예약 여부 조회
  @Get(':id/slots')
  @ApiOperation({ summary: '특정 공간 특정 일자 시간 슬롯 및 예약 여부 조회', description: 'ID, 날짜를 기준으로 시간 슬롯 및 예약 여부 조회' })
  @ApiParam({ name: 'id', type: Number, description: '조회할 공간 ID' })
  @ApiQuery({ name: 'date', type: Date, description: '검색할 날짜' })
  findSpaceSlots(@Param('id') st_id: number, @Query('date') date: string) {
    return this.spaceService.findSpaceSlots(+st_id, date);
  }
}
