import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationRequestOptionDto } from './reservation_request_option.dto';
import { PAY_METHOD } from '../../../common/constants/enum.constants';
import { ReservationRequestSlotDto } from './reservation_request_slot.dto';

@InputType()
export class ReservationRequestDto {
  @Field({ description: '비회원 이름' })
  @IsString()
  @IsNotEmpty()
  guest_name: string;

  @Field({ description: '비회원 연락처' })
  @IsString()
  @IsNotEmpty()
  guest_phone: string;

  @Field({ description: '결제 수단' })
  @IsString()
  @IsNotEmpty()
  pay_method: PAY_METHOD;

  @Field({ description: '총 인원 ' })
  @IsNumber()
  @IsNotEmpty()
  total_people: number;

  @Field(() => [ReservationRequestSlotDto], { nullable: true, description: '예약 시간 슬롯' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationRequestSlotDto)
  slots: ReservationRequestSlotDto[];

  @Field(() => [ReservationRequestOptionDto], { nullable: true, description: '선택 옵션' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationRequestOptionDto)
  options?: ReservationRequestOptionDto[];
}
