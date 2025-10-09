import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationRequestOptionDto } from './reservation_request_option.dto';
import { PAY_METHOD } from '../../../common/constants/enum.constants';

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

  @Field({ description: '예약 시작 날짜 (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  start_date: string;

  @Field({ description: '예약 시작 시간 (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @Field({ description: '예약 종료 날짜 (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  end_date: string;

  @Field({ description: '예약 종료 시간 (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  end_time: string;

  @Field(() => [ReservationRequestOptionDto], { nullable: true, description: '선택 옵션' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationRequestOptionDto)
  option?: ReservationRequestOptionDto[];
}
