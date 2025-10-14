import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRegisterRequestDto } from './dto/auth_register_request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';
import bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { PW_SALT_ROUNDS } from '../../common/constants/app.constants';
import { UserSession } from '../../entities/user_session.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,

    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async register(authRegisterRequestDto: AuthRegisterRequestDto) {
    const userId = authRegisterRequestDto.user_id;
    const userPhone = authRegisterRequestDto.user_phone;
    const userName = authRegisterRequestDto.user_name;

    // id 또는 연락처 겹치는 회원 확인
    const isExist = await this.userRepository.findOne({
      where: [{ user_id: userId }, { user_phone: userPhone }],
    });
    if (isExist) {
      return { success: false, msg: '이미 존재하는 id 또는 연락처' };
    }

    // 비밀번호 암호화
    const hashedPw = await bcrypt.hash(authRegisterRequestDto.user_pw, PW_SALT_ROUNDS);

    // 저장
    const newUser = this.userRepository.create({
      user_id: userId,
      user_pw: hashedPw,
      user_name: userName,
      user_phone: userPhone,
    });
    const saved = await this.userRepository.save(newUser);

    return { success: true, user_id: saved.user_id };
  }

  findAll() {
    return `This action returns all auth`;
  }

  // jwt token 조회
  async checkJwtToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token);

    return { success: true, payload: payload };
  }
}
