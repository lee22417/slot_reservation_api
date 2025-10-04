import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class StoreNotice {
  @PrimaryGeneratedColumn()
  sno_id: number;

  @Column({
    nullable: false,
    comment: 'store pk',
  })
  st_id: number;

  @Column({ nullable: false, length: 255, comment: '공지사항 제목' })
  notice_title: string;

  @Column({ nullable: false, type: 'text', comment: '공지사항 내용' })
  notice_content: string;

  @Column({ nullable: false, type: 'tinyint', comment: '공지사항 노출 여부' })
  notice_is_show: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
