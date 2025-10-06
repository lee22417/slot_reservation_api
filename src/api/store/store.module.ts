import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../../entities/store.entity';
import { StoreNotice } from '../../entities/store_notice.entity';
import { StoreHoliday } from '../../entities/store_holidy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreNotice, StoreHoliday])],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
