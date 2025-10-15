import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserSession } from '../../entities/user_session.entity';
import { Logger } from 'nestjs-pino';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,

    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // JwtStrategy로 JWT 서명 검증 수행
    const canActivate = await super.canActivate(context); // 부모 AuthGuard('jwt') 호출 → JwtStrategy 실행
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    // this.logger.debug('canActivate authHeader', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('no token');
    }

    const token = authHeader.split(' ')[1];

    // user_session 테이블 확인
    const session = await this.userSessionRepository.findOneBy({ token });
    if (!session) {
      throw new UnauthorizedException('invalid token');
    }

    // token 만료 시간 확인
    if (new Date() > session.expired_at) {
      throw new UnauthorizedException('token expired');
    }

    return true;
  }
}
