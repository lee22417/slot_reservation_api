import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../entities/user_session.entity';
import { JwtPayloadDto } from './dto/jwt_payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false, // 만료 시간 체크
    });
  }

  async validate(payload: JwtPayloadDto): Promise<JwtPayloadDto> {
    return { us_id: payload.us_id, user_id: payload.user_id, user_name: payload.user_name };
  }
}
