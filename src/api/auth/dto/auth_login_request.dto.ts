import { IsString, IsNotEmpty, Length } from 'class-validator';

export class AuthLoginRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20, { message: 'id는 4~20자 사이여야 합니다.' })
  user_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 30, { message: '비밀번호는 최소 6~30자 사이여야 합니다.' })
  user_pw: string;
}
