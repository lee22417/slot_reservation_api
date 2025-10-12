import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { formatDateSeoul } from '../common/utils/date.util';

@Entity('store_notice')
export class StoreNotice {
  @PrimaryGeneratedColumn()
  sno_id: number;

  @Column({ nullable: false, comment: 'store pk' })
  st_id: number;

  @Column({ nullable: false, length: 255, comment: '공지사항 제목' })
  notice_title: string;

  @Column({ nullable: false, type: 'text', comment: '공지사항 내용' })
  notice_content: string;

  @Column({ nullable: false, type: 'tinyint', comment: '공지사항 노출 여부' })
  notice_is_show: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // DB에 없는 계산 필드
  @Expose()
  get created_at_kst(): string {
    return formatDateSeoul(this.created_at); // 'Asia/Seoul' KST로 변환
  }
}
