import { Test, TestingModule } from '@nestjs/testing';
import { test, beforeEach, afterEach } from 'tap';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

let app: NestFastifyApplication;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterEach(async () => {
  await app.close();
});

test('/ping should return "pong"', async ({ equal, same }) => {
  const { statusCode, payload } = await app.inject({
    method: 'GET',
    url: '/ping',
  });
  equal(statusCode, 200);
  same(JSON.parse(payload), {});
});

test('/time should return server time', async ({ equal }) => {
  const { statusCode, payload } = await app.inject({
    method: 'GET',
    url: '/time',
  });
  const data = JSON.parse(payload);
  equal(statusCode, 200);
  equal(typeof data.serverTime, 'number');
});

test('/health should return server status', async ({ equal, same }) => {
  const { statusCode, payload } = await app.inject({
    method: 'GET',
    url: '/health',
  });
  const data = JSON.parse(payload);
  equal(statusCode, 200);
  equal(data.status, 'ok');
  same(data.error, {});
});
