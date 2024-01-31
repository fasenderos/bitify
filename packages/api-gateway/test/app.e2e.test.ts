import { test } from 'tap';
import { buildServer, createUser, removeUser } from './helper';
import { HttpClient } from './http-client';
import { HttpStatus } from '@nestjs/common';
import { ApiKeysService } from '../src/api-keys/api-keys.service';

test('/ping should return "pong"', async ({ equal, same, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());

  const { statusCode, payload } = await app.inject({
    method: 'GET',
    url: '/ping',
  });
  equal(statusCode, HttpStatus.OK);
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
  equal(statusCode, HttpStatus.OK);
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
  equal(statusCode, HttpStatus.OK);
  equal(data.status, 'ok');
  same(data.error, {});
});

test('test api-key authentication', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());
  const http = new HttpClient(app);

  const { user, password } = await createUser(app);
  const login = await http.login(user.email, password);
  const auth = login.body.accessToken;

  const mockBody = {
    notes: 'My Api Key',
    spot: 'read',
    wallet: 'read-write',
  };
  const response = await http.post('/apikeys', mockBody, auth);
  const { id, public: publicKey, secret: secretKey } = response.body;
  const timestamp = Date.now();
  const recvWindow = 5000;
  const params = 'foo=bar&baz=qux';
  const url = '/api/test-get?' + params;

  // Test valid signature for GET method with params
  {
    const signature = http.getSignature(
      secretKey,
      publicKey,
      params,
      timestamp,
    );
    const response = await http.get(url, undefined, {
      'X-BTF-SIGN': signature,
      'X-BTF-API-KEY': publicKey,
      'X-BTF-TIMESTAMP': timestamp,
      'X-BTF-RECV-WINDOW': recvWindow,
    });
    equal(response.statusCode, HttpStatus.OK);
  }

  // Test valid signature for GET method without params
  {
    const signature = http.getSignature(secretKey, publicKey, '', timestamp);
    const response = await http.get('/api/test-get', undefined, {
      'X-BTF-SIGN': signature,
      'X-BTF-API-KEY': publicKey,
      'X-BTF-TIMESTAMP': timestamp,
      'X-BTF-RECV-WINDOW': recvWindow,
    });
    equal(response.statusCode, HttpStatus.OK);
  }

  // Test valid signature for GET method with an empty param
  {
    const param = 'foo=bar&baz';
    const signature = http.getSignature(secretKey, publicKey, param, timestamp);
    const response = await http.get(`/api/test-get?${param}`, undefined, {
      'X-BTF-SIGN': signature,
      'X-BTF-API-KEY': publicKey,
      'X-BTF-TIMESTAMP': timestamp,
      'X-BTF-RECV-WINDOW': recvWindow,
    });
    equal(response.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  // Test get method without required headers
  {
    const signature = http.getSignature(secretKey, publicKey, params);
    {
      // No headers at all
      const response = await http.get(url);
      equal(response.statusCode, HttpStatus.UNAUTHORIZED);
    }

    {
      // Missing signature
      const response = await http.get(url, undefined, {
        'X-BTF-API-KEY': publicKey,
        'X-BTF-TIMESTAMP': timestamp,
      });
      equal(response.statusCode, HttpStatus.UNAUTHORIZED);
    }
    {
      // Missing apikey
      const response = await http.get(url, undefined, {
        'X-BTF-SIGN': signature,
        'X-BTF-TIMESTAMP': timestamp,
      });
      equal(response.statusCode, HttpStatus.UNAUTHORIZED);
    }
    {
      // Missing timestamp
      const response = await http.get(url, undefined, {
        'X-BTF-SIGN': signature,
        'X-BTF-API-KEY': publicKey,
      });
      equal(response.statusCode, HttpStatus.UNAUTHORIZED);
    }
  }

  const body = '{"foo":"bar","baz":"qux"}';
  // Test valid signature for POST method with body
  {
    const signature = http.getSignature(secretKey, publicKey, body, timestamp);
    const response = await http.post(
      '/api/test-post',
      JSON.parse(body),
      undefined,
      {
        'X-BTF-SIGN': signature,
        'X-BTF-API-KEY': publicKey,
        'X-BTF-TIMESTAMP': timestamp,
        'X-BTF-RECV-WINDOW': recvWindow,
      },
    );
    equal(response.statusCode, HttpStatus.OK);
  }
  // Test not valid signature
  {
    const signature = http.getSignature(secretKey, publicKey, body, timestamp);
    const response = await http.post(
      '/api/test-post',
      JSON.parse(body),
      undefined,
      {
        'X-BTF-SIGN': signature + 'somebrokenstring',
        'X-BTF-API-KEY': publicKey,
        'X-BTF-TIMESTAMP': timestamp,
        'X-BTF-RECV-WINDOW': recvWindow,
      },
    );
    equal(response.statusCode, HttpStatus.UNAUTHORIZED);
  }

  // The timestamp headers must adheres to the following rule
  // serverTime - recvWindow <= timestamp < serverTime + 1000
  // Test POST requests
  {
    {
      // Test for serverTime - recvWindow <= timestamp
      const timestamp = Date.now() - 5100;
      const signature = http.getSignature(
        secretKey,
        publicKey,
        body,
        timestamp,
      );
      const response = await http.post(
        '/api/test-post',
        JSON.parse(body),
        undefined,
        {
          'X-BTF-SIGN': signature,
          'X-BTF-API-KEY': publicKey,
          'X-BTF-TIMESTAMP': timestamp,
          'X-BTF-RECV-WINDOW': recvWindow,
        },
      );
      equal(response.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
      equal(
        response.body.message,
        'Timestamp for the request is outside of the recvWindow',
      );
    }
    {
      // Test for timestamp < serverTime + 1000
      const timestamp = Date.now() + 1100;
      const signature = http.getSignature(
        secretKey,
        publicKey,
        body,
        timestamp,
      );
      const response = await http.post(
        '/api/test-post',
        JSON.parse(body),
        undefined,
        {
          'X-BTF-SIGN': signature,
          'X-BTF-API-KEY': publicKey,
          'X-BTF-TIMESTAMP': timestamp,
          'X-BTF-RECV-WINDOW': recvWindow,
        },
      );
      equal(response.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
      equal(
        response.body.message,
        'Timestamp for the request is outside of the recvWindow',
      );
    }
  }

  // Test GET requests
  {
    {
      // Test for serverTime - recvWindow <= timestamp
      const timestamp = Date.now() - 5100;
      const signature = http.getSignature(
        secretKey,
        publicKey,
        params,
        timestamp,
      );
      const response = await http.get(url, undefined, {
        'X-BTF-SIGN': signature,
        'X-BTF-API-KEY': publicKey,
        'X-BTF-TIMESTAMP': timestamp,
        'X-BTF-RECV-WINDOW': recvWindow,
      });
      equal(response.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
      equal(
        response.body.message,
        'Timestamp for the request is outside of the recvWindow',
      );
    }
    {
      // Test for timestamp < serverTime + 1000
      const timestamp = Date.now() + 1100;
      const signature = http.getSignature(
        secretKey,
        publicKey,
        params,
        timestamp,
      );
      const response = await http.get(url, undefined, {
        'X-BTF-SIGN': signature,
        'X-BTF-API-KEY': publicKey,
        'X-BTF-TIMESTAMP': timestamp,
        'X-BTF-RECV-WINDOW': recvWindow,
      });
      equal(response.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
      equal(
        response.body.message,
        'Timestamp for the request is outside of the recvWindow',
      );
    }
  }

  // Check for api key expired
  {
    const apikeyService = app.get(ApiKeysService);
    // Set key as expired 1 minute ago
    await apikeyService.updateById(
      id,
      {
        // @ts-expect-error expiresAt can not be updated by api
        expiresAt: new Date(Date.now() - 60 * 1000),
      },
      user.id,
    );
    const signature = http.getSignature(
      secretKey,
      publicKey,
      params,
      timestamp,
    );
    const response = await http.get(url, undefined, {
      'X-BTF-SIGN': signature,
      'X-BTF-API-KEY': publicKey,
      'X-BTF-TIMESTAMP': timestamp,
      'X-BTF-RECV-WINDOW': recvWindow,
    });
    equal(response.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
    equal(response.body.message, 'Your api key is expired');
  }

  await removeUser(user.id, app);
});
