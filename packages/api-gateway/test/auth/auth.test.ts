import { Test, TestingModule } from '@nestjs/testing';
import { test, beforeEach, afterEach } from 'tap';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { authenticator } from 'otplib';

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

test('AuthController', async ({ equal }) => {
  const mockUser = {
    email: 'email@somesite.com',
    password: 'Test1234',
  };

  // Register user
  const register = await app.inject({
    method: 'POST',
    url: '/auth/register',
    body: mockUser,
  });
  equal(register.statusCode, HttpStatus.CREATED);

  // Check only one user with same email
  const retryregister = await app.inject({
    method: 'POST',
    url: '/auth/register',
    body: mockUser,
  });
  equal(retryregister.statusCode, HttpStatus.CONFLICT);

  // Wrong login
  const wrongLogin = await app.inject({
    method: 'POST',
    url: '/auth/login',
    body: { email: mockUser.email, password: 'wrongpassword' },
  });
  equal(wrongLogin.statusCode, HttpStatus.UNAUTHORIZED);

  // Successful login
  let login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    body: { email: mockUser.email, password: mockUser.password },
  });
  let payload = JSON.parse(login.payload);
  let accessToken = payload.accessToken;
  let refreshToken = payload.refreshToken;

  equal(login.statusCode, HttpStatus.OK);
  equal(typeof accessToken === 'string' && accessToken.length > 0, true);
  equal(typeof refreshToken === 'string' && refreshToken.length > 0, true);

  // Refresh token with wrong refreshToken
  const wrongRefresh = await app.inject({
    method: 'GET',
    url: '/auth/refresh-token',
    headers: { authorization: `Bearer ${accessToken}` },
  });
  equal(wrongRefresh.statusCode, HttpStatus.UNAUTHORIZED);

  // Refresh token with right Refresh Token
  const refresh = await app.inject({
    method: 'GET',
    url: '/auth/refresh-token',
    headers: { authorization: `Bearer ${refreshToken}` },
  });
  equal(refresh.statusCode, HttpStatus.OK);

  payload = JSON.parse(refresh.payload);
  accessToken = payload.accessToken;
  refreshToken = payload.refreshToken;

  equal(typeof accessToken === 'string' && accessToken.length > 0, true);
  equal(typeof refreshToken === 'string' && refreshToken.length > 0, true);

  // Enable 2FA
  const enable2FA = await app.inject({
    method: 'GET',
    url: '/auth/enable2fa',
    headers: { authorization: `Bearer ${accessToken}` },
  });
  equal(enable2FA.statusCode, HttpStatus.OK);
  const { secret, qrcode } = JSON.parse(enable2FA.payload);
  equal(typeof secret === 'string' && secret.length > 0, true);
  equal(typeof qrcode === 'string' && qrcode.length > 0, true);

  // Wrong OTP Verify 2FA
  const wrongVerify2FA = await app.inject({
    method: 'POST',
    url: '/auth/verify2fa',
    headers: { authorization: `Bearer ${accessToken}` },
    body: { otp: '000000', secret },
  });
  equal(wrongVerify2FA.statusCode, HttpStatus.UNAUTHORIZED);

  // Verify 2FA
  let otp = authenticator.generate(secret);
  const verify2FA = await app.inject({
    method: 'POST',
    url: '/auth/verify2fa',
    headers: { authorization: `Bearer ${accessToken}` },
    body: { otp, secret },
  });
  equal(verify2FA.statusCode, HttpStatus.OK);

  // Logout and login again to test Login with OTP
  const logout = await app.inject({
    method: 'GET',
    url: '/auth/logout',
    headers: { authorization: `Bearer ${accessToken}` },
  });
  equal(logout.statusCode, HttpStatus.OK);

  login = await app.inject({
    method: 'POST',
    url: '/auth/login',
    body: { email: mockUser.email, password: mockUser.password },
  });
  payload = JSON.parse(login.payload);
  const twoFactorToken = payload.twoFactorToken;

  // OTP Login with wrong accessToken
  otp = authenticator.generate(secret);
  const wrongLoginOtp = await app.inject({
    method: 'POST',
    url: '/auth/otp',
    headers: { authorization: `Bearer ${accessToken}` },
    body: { otp },
  });
  equal(wrongLoginOtp.statusCode, HttpStatus.UNAUTHORIZED);

  // OTP Login with wrong OTP
  const wrongOtp = await app.inject({
    method: 'POST',
    url: '/auth/otp',
    headers: { authorization: `Bearer ${accessToken}` },
    body: { otp: '000000' },
  });
  equal(wrongOtp.statusCode, HttpStatus.UNAUTHORIZED);

  // OTP Login with right TwoFactor Access Token
  const loginOtp = await app.inject({
    method: 'POST',
    url: '/auth/otp',
    headers: { authorization: `Bearer ${twoFactorToken}` },
    body: { otp },
  });
  equal(loginOtp.statusCode, HttpStatus.OK);
  payload = JSON.parse(loginOtp.payload);
  accessToken = payload.accessToken;
  refreshToken = payload.refreshToken;

  equal(typeof accessToken === 'string' && accessToken.length > 0, true);
  equal(typeof refreshToken === 'string' && refreshToken.length > 0, true);

  // Disable 2FA
  otp = authenticator.generate(secret);
  const disable2FA = await app.inject({
    method: 'POST',
    url: '/auth/disable2fa',
    headers: { authorization: `Bearer ${accessToken}` },
    body: { otp },
  });
  equal(disable2FA.statusCode, HttpStatus.OK);
});

test('AuthController missing Bearer token', async ({ equal }) => {
  const logout = await app.inject({
    method: 'GET',
    url: '/auth/logout',
  });
  equal(logout.statusCode, HttpStatus.UNAUTHORIZED);

  const refresh = await app.inject({
    method: 'GET',
    url: '/auth/refresh-token',
  });
  equal(refresh.statusCode, HttpStatus.UNAUTHORIZED);

  const otp = await app.inject({
    method: 'POST',
    url: '/auth/otp',
  });
  equal(otp.statusCode, HttpStatus.UNAUTHORIZED);

  const enable2fa = await app.inject({
    method: 'GET',
    url: '/auth/enable2fa',
  });
  equal(enable2fa.statusCode, HttpStatus.UNAUTHORIZED);

  const verify2fa = await app.inject({
    method: 'POST',
    url: '/auth/verify2fa',
  });
  equal(verify2fa.statusCode, HttpStatus.UNAUTHORIZED);

  const disable2FA = await app.inject({
    method: 'POST',
    url: '/auth/disable2fa',
  });
  equal(disable2FA.statusCode, HttpStatus.UNAUTHORIZED);
});
