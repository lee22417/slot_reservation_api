import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

@InputType()
export class ReservationGuestCancelRequestDto {
  @Field(() => String, { description: '비회원 연락처' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/, {
    message: 'guest_phone은 숫자 10~11자리여야 합니다.',
  })
  guest_phone: string;

  @Field(() => [String], { description: '결제 고유 번호' })
  @IsString()
  @IsNotEmpty()
  payment_id: string;
}
