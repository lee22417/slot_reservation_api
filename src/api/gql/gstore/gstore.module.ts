import { Module } from '@nestjs/common';
import { GstoreService } from './gstore.service';
import { GstoreResolver } from './gstore.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreNotice } from '../../../entities/store_notice.entity';
import { Store } from '../../../entities/store.entity';
import { StoreHoliday } from '../../../entities/store_holiday.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreNotice, StoreHoliday])],
  providers: [GstoreResolver, GstoreService],
})
export class GstoreModule {}
