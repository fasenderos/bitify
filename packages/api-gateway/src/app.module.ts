import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage } from 'http';
import { UsersModule } from './users/users.module';
import { TerminusModule } from '@nestjs/terminus';
import { DBModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ActivitiesModule } from './activities/activities.module';
import { AccessControlModule } from 'nest-access-control';
import { roles } from './app.roles';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { CipherModule } from './common/modules/cipher/cipher.module';
import { ServerResponse } from 'http';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      cache: true,
    }),
    EventEmitterModule.forRoot(),
    DBModule,
    LoggerModule.forRoot({
      pinoHttp: {
        // We want to use pino-pretty only if there is a human watching this,
        // otherwise we log as newline-delimited JSON.
        .../* istanbul ignore next */ (process.stdout.isTTY
          ? {
              transport: { target: 'pino-pretty' },
              level: 'debug',
            }
          : {
              level: 'info',
            }),
        // Define a custom logger level
        customLogLevel: function (_: IncomingMessage, res: ServerResponse) {
          if (res.statusCode == null || res.statusCode < 300) {
            // Disable logs for response without error
            return 'silent';
          } else if (res.statusCode >= 300 && res.statusCode < 500) {
            return 'warn';
          }
          // res.statusCode >= 500 || err
          /* istanbul ignore next - right now the only error 500 is auth/login which is excluded from logging */
          return 'error';
        },
        // Define additional custom request properties
        customProps: () => ({ appName: 'API' }),
        redact: {
          paths: ['req.headers.authorization'],
          remove: true,
        },
      },
      exclude: [
        // https://github.com/pillarjs/path-to-regexp#zero-or-more
        { method: RequestMethod.OPTIONS, path: ':all*' },
        { method: RequestMethod.HEAD, path: ':all*' },
        { method: RequestMethod.ALL, path: 'auth/:all+' },
      ],
    }),
    AccessControlModule.forRoles(roles),
    ActivitiesModule,
    ApiKeysModule,
    AuthModule,
    CipherModule,
    UsersModule,
    TerminusModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
