import { InputType, Field, Int } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ReservationGuestRequestSlotDto {
  @Field(() => String, { description: '예약 일자' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @Field(() => [String], { description: '예약 시간' })
  @IsArray()
  @IsNotEmpty()
  times: string[];
}
