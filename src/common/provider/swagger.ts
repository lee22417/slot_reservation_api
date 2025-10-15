import { INestApplication, Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

@Injectable()
export class Swagger {
  static setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Slot Reservation API') // API 제목
      .setDescription('Slot Reservation API 문서') // 설명
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          in: 'header',
          description: 'JWT 토큰',
        },
        'token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document); // http://{host}:{port}/api/docs 로 접근 가능
  }
}
