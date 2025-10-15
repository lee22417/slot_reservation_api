import { ApiProperty } from '@nestjs/swagger';

export class JwtPayloadDto {
  @ApiProperty({ example: 1, description: 'user pk' })
  us_id: number;

  @ApiProperty({ example: 'test1', description: '회원 id' })
  user_id: string;

  @ApiProperty({ example: '테스트', description: '회원 이름' })
  user_name: string;
}
