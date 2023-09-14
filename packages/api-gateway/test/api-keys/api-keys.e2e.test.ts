import { test } from 'tap';
import { buildServer, createUser } from '../helper';
import { HttpStatus } from '@nestjs/common';
import { ApiKey } from '../../src/api-keys/entities/api-key.entity';
import { HttpClient } from '../http-client';

test('shoul create api key', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());
  const http = new HttpClient(app);

  const { user, password } = await createUser(app);
  const login = await http.login(user.email, password);
  const auth = login.body.accessToken;

  const mockBody = {
    userIps: ['123.123.123.123'],
    spot: 'read',
    wallet: 'read-write',
  };
  // Test no auth
  const noAuth = await http.post('/api_keys', mockBody);
  equal(noAuth.statusCode, HttpStatus.UNAUTHORIZED);

  // Test with wrong body. One of spot or wallet is required
  const wrongBody = await http.post(
    '/api_keys',
    {
      userIps: mockBody.userIps,
    },
    auth,
  );
  equal(wrongBody.statusCode, HttpStatus.BAD_REQUEST);

  // Test with right body
  let response = await http.post('/api_keys', mockBody, auth);
  const first = response.body as ApiKey;
  let statusCode = response.statusCode;
  equal(statusCode, HttpStatus.CREATED);
  equal(first.public.length > 0, true);
  equal(first.secret.length > 0, true);
  equal(first.expiresAt, null); // UserIP are set

  response = await http.post(
    '/api_keys',
    {
      spot: mockBody.spot,
    },
    auth,
  );
  const second = response.body as ApiKey;
  statusCode = response.statusCode;
  equal(statusCode, HttpStatus.CREATED);
  equal(second.public.length > 0, true);
  equal(second.secret.length > 0, true);
  // When there is no ip, api key expires in 90 days
  equal(second.expiresAt != null, true);
});
