import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRegisterRequestDto } from './dto/auth_register_request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';
import bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_DAYS, PW_SALT_ROUNDS } from '../../common/constants/app.constants';
import { UserSession } from '../../entities/user_session.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginRequestDto } from './dto/auth_login_request.dto';
import { formatDateSeoul } from '../../common/utils/date.util';
import { JwtPayloadDto } from './dto/jwt_payload.dto';

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

  // 회원가입
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

  // 로그인
  async login(authLoginRequestDto: AuthLoginRequestDto) {
    // 회원 조회
    const user = await this.userRepository.findOneBy({ user_id: authLoginRequestDto.user_id });
    if (!user) {
      return { success: false, msg: '아이디 또는 비밀번호 불일치' };
    }

    // 비밀번호 확인
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const isPwValid = await bcrypt.compare(authLoginRequestDto.user_pw, user.user_pw);
    if (!isPwValid) {
      return { success: false, msg: '아이디 또는 비밀번호 불일치' };
    }

    // jwt token 발급
    const payload: JwtPayloadDto = { us_id: user.us_id, user_id: user.user_id, user_name: user.user_name };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + JWT_EXPIRES_IN_DAYS); // token 만료 시간

    // jwt token DB 저장
    const newSession = this.sessionRepository.create({
      token: token,
      expired_at: expiredAt,
    });
    await this.sessionRepository.save(newSession);

    return { success: true, token: token, expired_at: expiredAt, expired_at_kst: formatDateSeoul(expiredAt) };
  }
}
