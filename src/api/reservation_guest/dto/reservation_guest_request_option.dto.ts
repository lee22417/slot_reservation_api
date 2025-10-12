import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class ReservationGuestRequestOptionDto {
  @Field(() => Int, { description: '옵션 ID (sop_id)' })
  @IsInt()
  @IsNotEmpty()
  sop_id: number;

  @Field(() => Int, { description: '수량' })
  @IsInt()
  @Min(1)
  quantity: number;
}
