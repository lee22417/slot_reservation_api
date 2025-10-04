import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

//  create glocal Logger instance
const logger = new Logger('MAIN');

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

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Slot Reservation API') // API 제목
    .setDescription('Slot Reservation API 문서') // 설명
    .setVersion('1.0')
    // .addBearerAuth() // JWT 인증 사용 시
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://{host}:{port}/api 로 접근 가능

  app.useStaticAssets(join(__dirname, '..', 'public'));
  // app.setBaseViewsDir(join(__dirname, '..', 'views'));

  const appPort = 3000;
  logger.log('app listen ****** ' + appPort + ' ******');

  await app.listen(process.env.PORT ?? appPort);
}

bootstrap();
