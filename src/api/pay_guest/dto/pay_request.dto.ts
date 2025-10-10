import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class PayRequestDto {
  @Field(() => String, { description: '비회원 연락처' })
  @IsString()
  guest_phone: string;

  @Field(() => [String], { description: '결제 고유 번호' })
  @IsString()
  payment_id: string;
}
