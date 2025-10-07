/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { performance } from 'perf_hooks';
import { Logger } from '@nestjs/common';

// decorator - method에 설정 x

interface LogExecutionOptions {
  time?: boolean; // 실행 시간(ms)
  startEnd?: boolean; // 시작/종료 시각
  error?: boolean; // 에러 로그
  memory?: boolean; // 메모리 사용량
}

// 내부 서비스 method 로깅 (성능 분석용) (실행 시간, 시작/종료 시각, 에러, 메모리 사용량 기록)
export function LogExecutionDecorator(options: LogExecutionOptions = { time: true, startEnd: true, error: true, memory: false }) {
  const logger = new Logger('LogExecutionDecorator');

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const memoryStart = process.memoryUsage().heapUsed;
      const startTime = new Date();

      // log 공통 포멧
      const logHeader = `[${target.constructor.name}.${propertyKey}]`;
      const log = (message: string, isError: boolean = false) => {
        const logFull = `${logHeader} ${message}`;
        if (isError) {
          logger.error(logFull);
        } else {
          logger.debug(logFull);
        }
      };

      if (options.startEnd) {
        // method 실행 시작 시간
        log(`⏹ Start at: ${startTime.toISOString()}`);
      }

      let result: any;
      try {
        // -- 여기 위 코드까지 method 실행 전
        // 데코레이터 설정된 method 실행
        result = await Promise.resolve(originalMethod.apply(this, args));
      } catch (error) {
        if (options.error) {
          logger.error(`[${target.constructor.name}.${propertyKey}] ❌ Error: ${error.message}`, error.stack);
        }
        throw error;
      } finally {
        // 데코레이터 설정된 method 실행 후
        const end = performance.now();
        const memoryEnd = process.memoryUsage().heapUsed;
        const endTime = new Date();

        if (options.startEnd) {
          // method 실행 종료 시간
          log(`⏹ End at: ${endTime.toISOString()}`);
        }

        if (options.time) {
          // method 전체 실행 시간
          const ms = (end - start).toFixed(2);
          log(`⏱ Execution time: ${ms}ms`);
        }

        if (options.memory) {
          // 실행 후 메모리 사용량 변화
          const memUsed = ((memoryEnd - memoryStart) / 1024 / 1024).toFixed(2);
          log(`💾 Memory diff: ${memUsed} MB`);
        }
      }

      return result;
    };

    return descriptor;
  };
}
