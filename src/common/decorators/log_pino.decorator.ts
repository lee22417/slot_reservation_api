/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { LogPinoOptions, LogPinoService } from '../service/log_pino.service';

// 공통 method 데코레이터 팩토리 (DB, API, Cache tag별 옵션)
export function createLogPinoDecorator(defaultOptions: LogPinoOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const service: LogPinoService = this.logPinoService ?? this.loggerService; // DI 된 LogPinoService 참조
      if (!service) throw new Error('LogPinoService is not injected in this class!');

      // DB, API, Cache 등 tag별 실행 결과를 options에 반영
      const enhancedOptions: LogPinoOptions = { ...defaultOptions };

      // DB 전용: 실행 결과 row 수
      if (enhancedOptions.tag === 'db') {
        const result = await originalMethod.apply(this, args);
        enhancedOptions.rowCount = Array.isArray(result) ? result.length : 1; // 쿼리 row 수
        return service.logMethod(target.constructor.name, propertyKey, async () => result, enhancedOptions);
      }

      // API 전용: 응답 statusCode 기록
      if (enhancedOptions.tag === 'api') {
        const result = await originalMethod.apply(this, args);
        enhancedOptions.statusCode = result?.status || 0; // 응답 코드
        enhancedOptions.payload = result?.data ?? result ?? null; // payload (result.data가 있으면 사용, 없으면 result 전체)
        return service.logMethod(target.constructor.name, propertyKey, async () => result, enhancedOptions);
      }

      // Cache 전용: hit 여부 및 payload 크기 기록
      if (enhancedOptions.tag === 'cache') {
        const result = await originalMethod.apply(this, args);
        enhancedOptions.hit = result !== null && result !== undefined; // hit/miss 여부
        enhancedOptions.size = result ? JSON.stringify(result).length : 0; // payload 크기 (byte)
        enhancedOptions.ttl = result?.ttl ?? null; // TTL (유효시간)
        return service.logMethod(target.constructor.name, propertyKey, async () => result, enhancedOptions);
      }

      // 일반 execution
      return service.logMethod(target.constructor.name, propertyKey, () => originalMethod.apply(this, args), enhancedOptions);
    };

    return descriptor;
  };
}

// 일반 method 실행 로그 데코레이터 (전체 실행 시간, 실행 시작/종료 시간, 메모리)
export const LogPinoExecution = (options?: LogPinoOptions) => createLogPinoDecorator({ tag: 'execution', ...options });

// DB 쿼리 로그 데코레이터 (결과 row 수, slow query 감지)
export const LogPinoDBQuery = (options?: LogPinoOptions) =>
  createLogPinoDecorator({
    tag: 'db',
    ...options,
  });

// 외부 API 호출 데코레이터 (응답 상태 코드, payload)
export const LogPinoExternalApi = (options?: LogPinoOptions) =>
  createLogPinoDecorator({
    tag: 'api',
    ...options,
  });

// 캐시 로그 데코레이터 (hit/miss, TTL, payload 크기)
export const LogPinoCache = (options?: LogPinoOptions) =>
  createLogPinoDecorator({
    tag: 'cache',
    ...options,
  });
