import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// router 전에 실행

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor() {}

  // jwt token 여부만 확인
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization; // bearer {token}

    if (!authHeader) {
      throw new UnauthorizedException('no token');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('invalid bearer token');
    }

    next();
  }
}
