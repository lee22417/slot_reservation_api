import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { UserModule } from './api/user/user.module';
import { StoreModule } from './api/store/store.module';
import { SpaceModule } from './api/space/space.module';
import { ReservationGuestModule } from './api/reservation_guest/reservation_guest.module';
import { GstoreModule } from './api/gql/gstore/gstore.module';
import { GspaceModule } from './api/gql/gspace/gspace.module';
import { LoggerModule } from 'nestjs-pino';
import { PayGuestModule } from './api/pay_guest/pay_guest.module';
import { GuestModule } from './api/guest/guest.module';
import { AuthModule } from './api/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }), // typeorm
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // logging 설정
        let logging: boolean | ('query' | 'error' | 'schema' | 'warn' | 'info' | 'log' | 'migration')[] = false;
        if (process.env.NODE_ENV === 'dev') {
          logging = ['query', 'error'];
        } else if (process.env.NODE_ENV === 'prod') {
          logging = ['error'];
        }

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [join(__dirname, 'entities', '*.entity.{ts,js}')],
          synchronize: false,
          name: 'default', // default connection 설정
          logging: logging,
        };
      },
    }), // graphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
      playground: true,
    }), // pino log
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'res,req',
            // ignore: 'pid,hostname,context,res,req',
          },
        },
      },
    }),
    UserModule,
    StoreModule,
    SpaceModule,
    ReservationGuestModule,
    PayGuestModule,
    // graphql
    GstoreModule,
    GspaceModule,
    GuestModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
