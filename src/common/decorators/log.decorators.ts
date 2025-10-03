import {
  SetMetadata,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

// 공용 데코레이터/인터셉터

export const LogExecution = () => SetMetadata('log', true);

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const shouldLog = this.reflector.get<boolean>('log', handler); // LogExecution 데코레이터 확인
    if (!shouldLog) return next.handle();

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`Execution time: ${Date.now() - now}ms`)));
  }

  constructor(private reflector: Reflector) {}
}
