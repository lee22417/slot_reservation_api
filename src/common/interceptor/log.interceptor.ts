import { SetMetadata, Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

// interceptor - contorller method 전/후

// log 관련 공용 인터셉터 (contoller 수준)
export type LogType = 'execution-time' | 'start-time' | 'custom';
// default = ['execution-time']
export const LogInterceptor = (types: LogType[] = ['execution-time']) => SetMetadata('log-types', types);

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logger = new Logger('LoggingInterceptor');

    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    // 데코레이터에서 설정한 로그 타입 가져오기
    const logTypes: LogType[] = this.reflector.getAllAndOverride<LogType[]>('log-types', [handler, context.getClass()]) || [];

    const startTime = Date.now();

    // log 공통 포멧
    const logHeader = `[${className}.${methodName}]`;
    const log = (message: string) => {
      const full = `${logHeader} ${message}`;
      logger.log(full);
    };

    // -- 요청 시작 시점
    if (logTypes.includes('start-time')) {
      // 실행 시작 시간
      log(`Start time : ${new Date().toISOString()}`);
    }

    return next.handle().pipe(
      tap(() => {
        // -- 요청 끝난 시점 (tap() 안쪽)
        if (logTypes.includes('execution-time')) {
          // 전체 실행 시간
          log(`Execution time: ${Date.now() - startTime}ms`);
        }
        if (logTypes.includes('custom')) {
          log(` [CustomLog]`);
        }
      }),
    );
  }
}
