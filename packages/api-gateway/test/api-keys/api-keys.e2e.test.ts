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
    notes: 'My Api Key',
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
      notes: mockBody.notes,
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
  equal(first.notes, mockBody.notes);
  equal(new Date(first.expiresAt).getTime(), 0); // UserIP are set

  response = await http.post(
    '/api_keys',
    {
      notes: mockBody.notes,
      spot: mockBody.spot,
    },
    auth,
  );
  const second = response.body as ApiKey;
  statusCode = response.statusCode;
  equal(statusCode, HttpStatus.CREATED);
  equal(second.public.length > 0, true);
  equal(second.secret.length > 0, true);
  equal(second.notes, mockBody.notes);
  // When there is no ip, api key expires in 90 days
  equal(new Date(second.expiresAt).getTime() > Date.now(), true);
});

test('shoul find owned api keys', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());
  const http = new HttpClient(app);

  const { user: user1, password: password1 } = await createUser(app);
  const { user: user2, password: password2 } = await createUser(app);

  const login1 = await http.login(user1.email, password1);
  const login2 = await http.login(user2.email, password2);
  const auth1 = login1.body.accessToken;
  const auth2 = login2.body.accessToken;
  const mockBody = {
    notes: 'My Api Key',
    userIps: ['123.123.123.123'],
    spot: 'read',
    wallet: 'read-write',
  };

  const apiKeyUser1 = await http.post('/api_keys', mockBody, auth1);
  const apiKeyUser2 = await http.post('/api_keys', mockBody, auth2);

  // User should be able to get only owned apikey by id
  {
    // User 1
    const res = await http.get(`/api_keys/${apiKeyUser1.body.id}`, auth1);
    equal(res.statusCode, HttpStatus.OK);
    equal(res.body.id, apiKeyUser1.body.id);

    // Should be unauthorized if no auth is provided
    {
      const res = await http.get(`/api_keys/${apiKeyUser1.body.id}`);
      equal(res.statusCode, HttpStatus.UNAUTHORIZED);
    }
    // Should be unauthorized if wrong auth is provided
    {
      const res = await http.get(
        `/api_keys/${apiKeyUser1.body.id}`,
        'somewrongaccesstoken',
      );
      equal(res.statusCode, HttpStatus.UNAUTHORIZED);
    }
  }
  {
    // User 2
    const res = await http.get(`/api_keys/${apiKeyUser2.body.id}`, auth2);
    equal(res.statusCode, HttpStatus.OK);
    equal(res.body.id, apiKeyUser2.body.id);
  }

  // Should not able to get api key of other user by id
  {
    // User 1
    const res = await http.get(`/api_keys/${apiKeyUser2.body.id}`, auth1);
    equal(res.statusCode, HttpStatus.NOT_FOUND);
  }
  {
    // User 2
    const res = await http.get(`/api_keys/${apiKeyUser1.body.id}`, auth2);
    equal(res.statusCode, HttpStatus.NOT_FOUND);
  }

  // Should be able to find all owned apikeys
  {
    // User 1
    const res = await http.get(`/api_keys`, auth1);
    equal(res.statusCode, HttpStatus.OK);
    equal(Array.isArray(res.body), true);
    equal(res.body.length, 1);
    equal(res.body[0].id, apiKeyUser1.body.id);
    // Should be unauthorized if no auth is provided
    {
      const res = await http.get('/api_keys');
      equal(res.statusCode, HttpStatus.UNAUTHORIZED);
    }
    // Should be unauthorized if wrong auth is provided
    {
      const res = await http.get('/api_keys', 'somewrongaccesstoken');
      equal(res.statusCode, HttpStatus.UNAUTHORIZED);
    }
  }

  {
    // User 2
    const res = await http.get(`/api_keys`, auth2);
    equal(res.statusCode, HttpStatus.OK);
    equal(Array.isArray(res.body), true);
    equal(res.body.length, 1);
    equal(res.body[0].id, apiKeyUser2.body.id);
  }
});

test('shoul update owned api keys', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());
  const http = new HttpClient(app);

  const { user: user1, password: password1 } = await createUser(app);
  const { user: user2, password: password2 } = await createUser(app);

  const login1 = await http.login(user1.email, password1);
  const login2 = await http.login(user2.email, password2);
  const auth1 = login1.body.accessToken;
  const auth2 = login2.body.accessToken;
  const mockBody = {
    notes: 'My Api Key',
    userIps: ['123.123.123.123'],
    spot: 'read',
    wallet: 'read-write',
  };

  const apiKeyUser1 = await http.post('/api_keys', mockBody, auth1);
  const apiKeyUser2 = await http.post('/api_keys', mockBody, auth2);

  const mockUpdate = {
    spot: 'read-write',
    userIps: null,
  };

  // User should be able to update only owned apikey by id
  {
    // User 1
    // Before the update expiresAt should be 0
    equal(new Date(apiKeyUser1.body.expiresAt).getTime(), 0);
    // After the update expiresAt should be a date
    const res = await http.patch(
      `/api_keys/${apiKeyUser1.body.id}`,
      mockUpdate,
      auth1,
    );
    equal(res.statusCode, HttpStatus.NO_CONTENT);
    const updated = await http.get(`/api_keys/${apiKeyUser1.body.id}`, auth1);
    equal(updated.body.spot, mockUpdate.spot);
    equal(updated.body.userIps, null);
    equal(new Date(updated.body.expiresAt).getTime() > Date.now(), true);
  }
  {
    // User 2
    // Before the update expiresAt should be 0
    equal(new Date(apiKeyUser2.body.expiresAt).getTime(), 0);
    // After the update expiresAt should be a date
    const res = await http.patch(
      `/api_keys/${apiKeyUser2.body.id}`,
      mockUpdate,
      auth2,
    );
    equal(res.statusCode, HttpStatus.NO_CONTENT);
    const updated = await http.get(`/api_keys/${apiKeyUser2.body.id}`, auth2);
    equal(updated.body.spot, mockUpdate.spot);
    equal(updated.body.userIps, null);
    equal(new Date(updated.body.expiresAt).getTime() > Date.now(), true);
  }

  // Should not able to update api key of other user by id
  {
    // User 1
    const res = await http.patch(
      `/api_keys/${apiKeyUser2.body.id}`,
      mockUpdate,
      auth1,
    );
    equal(res.statusCode, HttpStatus.NOT_FOUND);
  }
  {
    // User 2
    const res = await http.patch(
      `/api_keys/${apiKeyUser1.body.id}`,
      mockUpdate,
      auth2,
    );
    equal(res.statusCode, HttpStatus.NOT_FOUND);
  }
});

test('shoul delete owned api keys', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());
  const http = new HttpClient(app);

  const { user: user1, password: password1 } = await createUser(app);
  const { user: user2, password: password2 } = await createUser(app);

  const login1 = await http.login(user1.email, password1);
  const login2 = await http.login(user2.email, password2);
  const auth1 = login1.body.accessToken;
  const auth2 = login2.body.accessToken;
  const mockBody = {
    notes: 'My Api Key',
    userIps: ['123.123.123.123'],
    spot: 'read',
    wallet: 'read-write',
  };

  const apiKeyUser1 = await http.post('/api_keys', mockBody, auth1);
  const apiKeyUser2 = await http.post('/api_keys', mockBody, auth2);

  // Should not able to delete api key of other user by id
  {
    // User 1
    const res = await http.del(`/api_keys/${apiKeyUser2.body.id}`, auth1);
    equal(res.statusCode, HttpStatus.NOT_FOUND);
  }
  {
    // User 2
    const res = await http.del(`/api_keys/${apiKeyUser1.body.id}`, auth2);
    equal(res.statusCode, HttpStatus.NOT_FOUND);
  }

  // User should be able to delete only owned apikey by id
  {
    // User 1
    const res = await http.del(`/api_keys/${apiKeyUser1.body.id}`, auth1);
    equal(res.statusCode, HttpStatus.NO_CONTENT);
    const deleted = await http.get(`/api_keys/${apiKeyUser1.body.id}`, auth1);
    equal(deleted.statusCode, HttpStatus.NOT_FOUND);
  }
  {
    // User 2
    const res = await http.del(`/api_keys/${apiKeyUser2.body.id}`, auth2);
    equal(res.statusCode, HttpStatus.NO_CONTENT);
    const deleted = await http.get(`/api_keys/${apiKeyUser2.body.id}`, auth2);
    equal(deleted.statusCode, HttpStatus.NOT_FOUND);
  }
});
