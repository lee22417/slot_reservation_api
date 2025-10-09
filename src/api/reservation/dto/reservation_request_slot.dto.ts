import { InputType, Field, Int } from '@nestjs/graphql';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class ReservationRequestSlotDto {
  @Field(() => String, { description: '예약 일자' })
  @IsString()
  date: string;

  @Field(() => [String], { description: '예약 시간' })
  @IsArray()
  times: string[];
}
