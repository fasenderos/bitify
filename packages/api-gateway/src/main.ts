import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppConfig } from '../typings/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  const pinoLogger = app.get(Logger);
  app.useLogger(pinoLogger);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // Get configService
  const configService: ConfigService = app.get(ConfigService);
  const { port, address } = configService.get<AppConfig['server']>(
    'server',
  ) as AppConfig['server'];
  const { name, version } = configService.get<AppConfig['app']>(
    'app',
  ) as AppConfig['app'];

  await app.listen(port, address);
  pinoLogger.log(`${name}@v${version} is running on: ${await app.getUrl()}`);
}
bootstrap().catch((e: Error) => {
  console.error(`Error starting server\n${e.message}\n${e.stack ?? ''}`);
  throw e;
});
