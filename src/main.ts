import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { LoggingInterceptor } from './common/interceptor/log.interceptor';
import { Logger } from 'nestjs-pino';
import { Swagger } from './common/provider/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  // whitelist
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cors
  app.enableCors();

  // url prefix 설정
  // app.setGlobalPrefix('api');

  // Swagger 설정
  Swagger.setupSwagger(app);

  // interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(Reflector))); // log interceptor

  // pino
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Nest - payload too large error
  // app.use(json({ limit: '50mb' }));
  // app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  // app.setBaseViewsDir(join(__dirname, '..', 'views'));

  const appPort = process.env.PORT ?? 3000;
  logger.log('app listen ****** ' + appPort + ' ******');
  logger.log('env **** ' + process.env.NODE_ENV + ' ****');

  await app.listen(appPort);
}

bootstrap();
