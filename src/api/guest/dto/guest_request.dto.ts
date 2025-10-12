import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

@InputType()
export class GuestRequestDto {
  @Field(() => String, { description: '비회원 연락처' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/, {
    message: 'guest_phone은 숫자 10~11자리여야 합니다.',
  })
  guest_phone: string;

  @Field(() => [String], { description: '결제 고유 번호 뒷6자리' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'payment_id_suffix는 정확히 6자리여야 합니다.' })
  payment_id_suffix: string;
}
