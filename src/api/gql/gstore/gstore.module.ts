import { Module } from '@nestjs/common';
import { GstoreService } from './gstore.service';
import { GstoreResolver } from './gstore.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreNotice } from '../../../entities/store_notice.entity';
import { Store } from '../../../entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreNotice])],
  providers: [GstoreResolver, GstoreService],
})
export class GstoreModule { }
