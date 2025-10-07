import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 모든 상점 조회
  @Get()
  @ApiOperation({ summary: '모든 상점 조회', description: '페이지네이션과 이름, 상태 필터를 지원하여 모든 상점 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 아이템 수 (기본: 10)' })
  @ApiQuery({ name: 'status', required: false, type: Number, description: '상점 상태로 필터링 [0|1]' })
  @ApiQuery({ name: 'name', required: false, type: String, description: '상점 이름으로 필터링' })
  async findAllStore(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: number,
    @Query('name') storeName?: string,
  ) {
    const storeStatus = status !== undefined ? +status : undefined;
    return await this.storeService.findAllStore(+page, +limit, storeStatus, storeName);
  }

  // 특정 상점 모든 정보 조회
  @Get(':id')
  @ApiOperation({ summary: '특정 상점 조회', description: 'ID를 기준으로 특정 상점의 정보 조회' })
  @ApiParam({ name: 'id', type: Number, description: '조회할 상점 ID' })
  @ApiQuery({ name: 'is_show', required: false, type: Number, description: '공지사항을 노출 여부로 필터링' })
  findOneStore(@Param('id') stId: number, @Query('is_show') noticeIsShow?: string) {
    let filterIsShow: number | undefined;
    if (noticeIsShow === '0') {
      filterIsShow = 0;
    } else if (noticeIsShow === '1') {
      filterIsShow = 1;
    }

    const result = this.storeService.findOneStore(+stId, filterIsShow);
    return instanceToPlain(result); // Expose() 필드 포함되도록 변환
  }

  // 특정 상점 모든 공간 조회
  @Get(':id/space')
  @ApiOperation({ summary: '특정 상점 모든 공간 조회', description: 'ID를 기준으로 특정 상점의 모든 공간 조회' })
  @ApiParam({ name: 'id', type: Number, description: '조회할 상점 ID' })
  @ApiQuery({ name: 'status', required: false, type: Number, description: '공간 운영 여부로 필터링 (0:미운영,1:운영)' })
  findAllSpace(@Param('id') stId: number, @Query('status') spaceStatus?: string) {
    let filterStatus: number | undefined;
    if (spaceStatus === '0') {
      filterStatus = 0;
    } else if (spaceStatus === '1') {
      filterStatus = 1;
    }

    return this.storeService.findAllSpace(+stId, filterStatus);
  }

  // 특정 상점 결제 정보 조회
  @Get(':id/pay_setting')
  @ApiOperation({ summary: '특정 상점 결제 정보 조회', description: 'ID를 기준으로 특정 상점의 결제 정보 조회' })
  @ApiParam({ name: 'id', type: Number, description: '조회할 상점 ID' })
  findOnePaySetting(@Param('id') stId: number) {
    return this.storeService.findOnePaySetting(+stId);
  }
}
