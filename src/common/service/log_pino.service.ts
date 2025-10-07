/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { SLOW_QUERY_THRESHOLD } from '../constants/app.constants';

// decorator 옵션
export interface LogPinoOptions {
  // --- general
  time?: boolean; // 실행 시간(ms) 표시 여부
  startEnd?: boolean; // 시작/종료 시각 표시 여부
  error?: boolean; // 에러 로그 표시 여부
  memory?: boolean; // 메모리 사용량 표시 여부
  toFile?: boolean; // JSON 파일 저장 여부
  logDir?: string; // 로그 파일 경로
  // --- 태그 (실행 타입 구분)
  tag?: string;
  // --- DB 전용 (실제 값)
  rowCount?: number; // 쿼리 row 수
  duration?: number; // 전체 실행 시간
  // --- API 전용
  statusCode?: number; // 응답 코드
  payload?: string; // payload
  // --- 캐시 전용
  hit?: boolean; // hit/miss 여부
  size?: number; // payload 크기 (byte)
  ttl?: string; // TTL (유효시간)
}

// pino 로그 출력 및 파일 저장
// 내부 서비스 method 로깅 (성능 분석용) (실행 시간, 시작/종료 시각, 에러, 메모리 사용량 기록)
// + 로그 파일 저장 지원
@Injectable()
export class LogPinoService {
  constructor(@InjectPinoLogger(LogPinoService.name) private readonly pinoLogger: PinoLogger) {}

  async logMethod(
    targetName: string,
    methodName: string,
    fn: () => Promise<any>,
    options: LogPinoOptions = { time: true, startEnd: true, error: true, memory: true, toFile: true, logDir: 'public/logs' },
  ) {
    const logDir = path.resolve(process.cwd(), options.logDir || 'public/logs'); // 로그 저장 폴더

    // 로그 폴더 없으면 성생
    if (options.toFile && !fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const startTime = new Date();
    const startPerf = performance.now();
    const memoryStart = process.memoryUsage().heapUsed;

    const logs: any[] = []; // 출력 및 저장되는 로그

    // 로그 출력 및 배열에 저장
    const logEntry = (level: 'debug' | 'info' | 'error', message: string, extra?: object) => {
      // 로그 배열에 저장
      const entry = { timestamp: new Date().toISOString(), target: targetName, method: methodName, message, ...extra };
      logs.push(entry); // 파일에 저장할 로그
      this.pinoLogger[level](entry); // 로그 출력
    };

    // tag에 따라 로그 출력 및 배열에 저장
    const logEntryExtra = (level: 'debug' | 'info' | 'error') => {
      const extra: any = {};
      // DB 관련
      if (options.tag === 'db' && options.rowCount !== undefined) {
        extra.rowCount = options.rowCount; // 쿼리 row 수
        extra.isSlow = options.duration !== undefined && options.duration >= SLOW_QUERY_THRESHOLD; // slow query 여부
      }
      // api 관련
      if (options.tag === 'api' && options.statusCode !== undefined) {
        extra.statusCode = options.statusCode; // 응답 코드
        extra.payload = options.payload; // payload
      }
      // 캐시 관련
      if (options.tag === 'cache') {
        extra.hit = options.hit; // hit/miss 여부
        extra.size = options.size; // payload 크기 (byte)
        extra.ttl = options.ttl; // TTL (유효시간)
      }

      logEntry(level, options.tag ?? 'execution', extra);
    };

    if (options.startEnd) {
      // method 실행 시작 시간
      logEntry('debug', `▶️ Start at: ${startTime.toISOString()}`);
    }

    let result: any;
    try {
      // -- 여기 위 코드까지 method 실행 전
      // 데코레이터 설정된 method 실행
      result = await fn();
    } catch (err: any) {
      if (options.error) {
        logEntry(`error`, `❌ Error: ${err.message}`, { stack: err.stack });
      }
      throw err;
    } finally {
      // 데코레이터 설정된 method 실행 후
      const endTime = new Date();
      const endPerf = performance.now();
      const memoryEnd = process.memoryUsage().heapUsed;
      options.duration = endPerf - startPerf; // 전체 실행 시간

      if (options.startEnd) {
        // method 실행 종료 시간
        logEntry('debug', `⏹ End at: ${endTime.toISOString()}`);
      }
      if (options.time) {
        // method 전체 실행 시간
        logEntry('debug', `⏱ Execution time: ${(endPerf - startPerf).toFixed(2)}ms`);
      }
      if (options.memory) {
        // 실행 후 메모리 사용량 변화
        logEntry('debug', `💾 Memory diff: ${((memoryEnd - memoryStart) / 1024 / 1024).toFixed(2)} MB`);
      }

      // 파일 저장
      if (options.toFile) {
        const filePath = path.join(logDir, `${startTime.toISOString().split('T')[0]}.log`);
        logs.forEach((entry) => fs.appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf8'));
        /* 파일 저장 포멧 예시
          {"timestamp":"2025-10-07T19:25:37.920Z","target":"ReservationService","method":"createReservation","message":"▶️ Start at: 2025-10-07T19:25:37.920Z"}
          {"timestamp":"2025-10-07T19:25:37.936Z","target":"ReservationService","method":"createReservation","message":"⏹ End at: 2025-10-07T19:25:37.936Z"}
          {"timestamp":"2025-10-07T19:25:37.936Z","target":"ReservationService","method":"createReservation","message":"⏱ Execution time: 15.79ms"}
          {"timestamp":"2025-10-07T19:25:37.936Z","target":"ReservationService","method":"createReservation","message":"💾 Memory diff: 1.21 MB"}
        */
      }
    }

    logEntryExtra('debug');

    return result;
  }
}
