import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GspaceService } from './gspace.service';
import { SpaceModel } from '../../../model/gstore_space.model';
import { SpaceOptionModel } from '../../../model/gstore_space_option.model';
import { SpaceScheduleModel } from '../../../model/gstore_space_schedule.model';

@Resolver(() => SpaceModel)
export class GspaceResolver {
  constructor(private readonly gspaceService: GspaceService) {}

  @Query(() => [SpaceModel], { name: 'spaces', nullable: true, description: 'ID를 기준으로 특정 상점 공간 조회' })
  async findALLSpace(@Args('id', { type: () => Int }) st_id: number) {
    return await this.gspaceService.findALLSpace(st_id);
  }

  @Query(() => [SpaceOptionModel], { name: 'spaceoptions', nullable: true, description: 'ID를 기준으로 특정 공간 옵션 조회' })
  async findALLSpaceOptions(@Args('id', { type: () => Int }) sp_id: number) {
    return await this.gspaceService.findALLSpaceOptions(sp_id);
  }

  @Query(() => [SpaceScheduleModel], { name: 'spaceschedules', nullable: true, description: 'ID를 기준으로 특정 공간 스케줄 조회' })
  async findALLSpaceSchedules(@Args('id', { type: () => Int }) sp_id: number) {
    return await this.gspaceService.findALLSpaceSchedules(sp_id);
  }
}
