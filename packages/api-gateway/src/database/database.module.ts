import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../../typings/common';
import path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const { host, port, username, password, database } = configService.get<
          AppConfig['db']
        >('db') as AppConfig['db'];
        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          // TODO
          synchronize: true,
          entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DBModule {}
