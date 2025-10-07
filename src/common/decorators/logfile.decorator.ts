/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { performance } from 'perf_hooks';
import { Logger } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';

// decorator - method에 설정 x
// log.decorator.ts를 파일 저장하는 버전

interface LogFileExecutionOptions {
  time?: boolean; // 실행 시간(ms)
  startEnd?: boolean; // 시작/종료 시각
  error?: boolean; // 에러 로그
  memory?: boolean; // 메모리 사용량
  toFile?: boolean; // 파일 저장 여부
  logDir?: string; // 로그 파일 경로
  tag?: string; // 구분용 태그
}

// 내부 서비스 method 로깅 (성능 분석용) (실행 시간, 시작/종료 시각, 에러, 메모리 사용량 기록)
// + 로그 파일 저장 지원
export function LogFileExecutionDecorator(
  options: LogFileExecutionOptions = { time: true, startEnd: true, error: true, memory: true, toFile: true, logDir: 'public/logs' },
) {
  const logger = new Logger('LogExecutionDecorator');
  const logDir = path.resolve(process.cwd(), options.logDir || 'logs'); // 로그 저장 폴더

  if (options.toFile) {
    // 로그 폴더 없으면 성생
    fs.mkdirSync(logDir, { recursive: true });
  }

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const memoryStart = process.memoryUsage().heapUsed;
      const startTime = new Date();

      const logs: string[] = []; // 출력 및 저장되는 로그

      // log 공통 포멧
      const tag = options.tag ? `[${options.tag}]` : '';
      const logHeader = `[${target.constructor.name}.${propertyKey}]${tag}`;
      const log = (message: string) => {
        const logFull = `${new Date().toISOString()} ${logHeader} ${message}`;
        logger.debug(logFull); // 로그 콘솔 출력
        if (options.toFile) {
          logs.push(logFull); // 파일에 저장할 로그
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
          log(`❌ Error: ${error.message}`);
          log(error.stack ?? '');
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

      if (options.toFile) {
        // 파일 저장
        const filePath = path.join(logDir, `${startTime.toISOString().split('T')[0]}.log`);
        fs.appendFileSync(filePath, logs.join('\n') + '\n', 'utf8');
        // 파일 출력 예
        /*
          2025-10-07T18:18:57.827Z [ReservationService.createReservation] ⏹ Start at: 2025-10-07T18:18:57.827Z
          2025-10-07T18:18:57.845Z [ReservationService.createReservation] ⏹ End at: 2025-10-07T18:18:57.845Z
          2025-10-07T18:18:57.845Z [ReservationService.createReservation] ⏱ Execution time: 18.62ms
          2025-10-07T18:18:57.845Z [ReservationService.createReservation] 💾 Memory diff: 1.49 MB
        */
      }

      return result;
    };

    return descriptor;
  };
}

/*
@LogDBQuery() 같은 세분화 데코레이터 조합

이건 “공통 로깅 시스템을 여러 카테고리로 세분화한 버전”이에요.
*/
