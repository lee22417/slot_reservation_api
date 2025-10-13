import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class AuthRegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20, { message: 'id는 4~20자 사이여야 합니다.' })
  user_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 30, { message: '비밀번호는 최소 6~30자 사이여야 합니다.' })
  user_pw: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20, { message: 'user_name은 2~20자 사이여야 합니다.' })
  user_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/, { message: 'user_phone은 숫자 10~11자리여야 합니다.' })
  user_phone: string;
}
