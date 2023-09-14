import { test } from 'tap';
import { buildServer } from './helper';

test('/ping should return "pong"', async ({ equal, same, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const { statusCode, payload } = await app.inject({
    method: 'GET',
    url: '/ping',
  });
  equal(statusCode, 200);
  same(JSON.parse(payload), {});
});

test('/time should return server time', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const { statusCode, payload } = await app.inject({
    method: 'GET',
    url: '/time',
  });
  const data = JSON.parse(payload);
  equal(statusCode, 200);
  equal(typeof data.serverTime, 'number');
});

test('/health should return server status', async ({
  equal,
  same,
  teardown,
}) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const { statusCode, payload } = await app.inject({
    method: 'GET',
    url: '/health',
  });
  const data = JSON.parse(payload);
  equal(statusCode, 200);
  equal(data.status, 'ok');
  same(data.error, {});
});
