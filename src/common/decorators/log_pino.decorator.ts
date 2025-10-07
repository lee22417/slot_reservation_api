/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { LogPinoOptions, LogPinoService } from '../service/log_pino.service';

// method decorator
export function LogPinoExecution(options: LogPinoOptions = { time: true, startEnd: true, error: true, memory: false, toFile: false }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const service: LogPinoService = this.logPinoService ?? this.loggerService; // DI 된 LogPinoService 참조
      if (!service) throw new Error('LogPinoService is not injected in this class!');

      return service.logMethod(target.constructor.name, propertyKey, () => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}
