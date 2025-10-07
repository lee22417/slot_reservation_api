// src/common/service/payment-id.service.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pay } from '../../entities/pay.entity';

@Injectable()
export class PaymentIdService {
  constructor(
    @InjectRepository(Pay)
    private readonly paymentRepository: Repository<Pay>,
  ) {}

  // payment_id 생성
  private generatePaymentId(): string {
    const date = new Date();
    const dateStr = date.toISOString().replace(/[-:.TZ]/g, ''); // 20251008T002345 -> 20251008002345
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6자리 랜덤 문자열
    return `PAY-${dateStr}-${randomStr}`;
  }

  // 중복 체크 및 고유 payment_id 생성
  async createUniquePaymentId(): Promise<string> {
    let paymentId: string;
    let exists = true;

    do {
      paymentId = this.generatePaymentId();
      const found = await this.paymentRepository.findOneBy({ payment_id: paymentId });
      exists = !!found; // boolean으로 형변환
    } while (exists);

    return paymentId;
  }
}
