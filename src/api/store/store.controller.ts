import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Store') // Swagger 그룹 이름
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  // 모든 지점 조회
  @Get()
  @ApiOperation({
    summary: '모든 지점 조회',
    description: '페이지네이션과 이름, 상태 필터를 지원하여 모든 지점 조회',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 아이템 수 (기본: 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
    description: '상점 상태로 필터링 [0|1]',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: '상점 이름으로 필터링',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: number,
    @Query('name') store_name?: string,
  ) {
    const store_status = status !== undefined ? +status : undefined;
    return await this.storeService.findAll(
      +page,
      +limit,
      store_status,
      store_name,
    );
  }

  // 특정 지점 정보 조회
  @Get('/:id')
  @ApiOperation({
    summary: '특정 지점 조회',
    description: 'ID를 기준으로 특정 지점의 정보 조회',
  })
  @ApiParam({ name: 'id', type: Number, description: '조회할 지점 ID' })
  findOne(@Param('id') st_id: number) {
    return this.storeService.findOne(+st_id);
  }

  // 특정 지점 공지사항 조회
  @Get('/:id/notice')
  @ApiOperation({
    summary: '특정 지점 공지 조회',
    description: 'ID를 기준으로 특정 지점의 모든 공지사항 조회',
  })
  @ApiParam({ name: 'id', type: Number, description: '조회할 지점 ID' })
  @ApiQuery({
    name: 'is_show',
    required: false,
    type: Number,
    description: '공지사항 노출 여부로 필터링',
  })
  async findAllNotice(
    @Param('id') st_id: number,
    @Query('is_show') notice_is_show?: string,
  ) {
    let filterIsShow: number | undefined;
    if (notice_is_show === '0') {
      filterIsShow = 0;
    } else if (notice_is_show === '1') {
      filterIsShow = 1;
    }

    return this.storeService.findAllNotice(st_id, filterIsShow);
  }
}
