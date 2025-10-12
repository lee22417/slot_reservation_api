import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Matches, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationGuestRequestOptionDto } from './reservation_guest_request_option.dto';
import { PAY_METHOD } from '../../../common/constants/enum.constants';
import { ReservationGuestRequestSlotDto } from './reservation_guest_request_slot.dto';

@InputType()
export class ReservationGuestRequestDto {
  @Field({ description: '비회원 이름' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20, { message: 'guest_name은 2자리 이상 20자리 이하이어야 합니다.' })
  guest_name: string;

  @Field({ description: '비회원 연락처' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/, {
    message: 'guest_phone은 숫자 10~11자리여야 합니다.',
  })
  guest_phone: string;

  @Field({ description: '결제 수단' })
  @IsString()
  @IsNotEmpty()
  pay_method: PAY_METHOD;

  @Field({ description: '총 인원 ' })
  @IsNumber()
  @IsNotEmpty()
  total_people: number;

  @Field(() => [ReservationGuestRequestSlotDto], { nullable: true, description: '예약 시간 슬롯' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationGuestRequestSlotDto)
  slots: ReservationGuestRequestSlotDto[];

  @Field(() => [ReservationGuestRequestOptionDto], { nullable: true, description: '선택 옵션' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationGuestRequestOptionDto)
  options?: ReservationGuestRequestOptionDto[];
}
