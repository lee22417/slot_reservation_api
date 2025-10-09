import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class ReservationRequestOptionDto {
  @Field(() => Int, { nullable: true, description: '옵션 ID (sop_id)' })
  @IsInt()
  sop_id: number;

  @Field(() => Int, { nullable: true, description: '수량' })
  @IsInt()
  @Min(1)
  quantity: number;
}
