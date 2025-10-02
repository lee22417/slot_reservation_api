import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

//  create glocal Logger instance
const logger = new Logger('MAIN');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cors
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'public'));
  // app.setBaseViewsDir(join(__dirname, '..', 'views'));

  const appPort = 3000;
  logger.log('app listen ****** ' + appPort + ' ******');
  await app.listen(appPort);
  
  await app.listen(process.env.PORT ?? appPort);
}

bootstrap();
