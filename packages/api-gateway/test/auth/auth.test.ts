import { Test, TestingModule } from '@nestjs/testing';
import { test, beforeEach, afterEach } from 'tap';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { authenticator } from 'otplib';
import { clearDatabase } from '../helper';
import { DataSource } from 'typeorm';
import { createRandomString } from '../../src/common/utils';
import { HttpClient } from '../http-client';
import { UserService } from '../../src/user/user.service';
import { User } from '../../src/user/entities/user.entity';
import { UserState } from '../../src/common/constants';
import { RecoveryTokenService } from '../../src/recovery-token/recovery-token.service';

let app: NestFastifyApplication;
let http: HttpClient;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  http = new HttpClient(app);
});

afterEach(async () => {
  const dataSource = app.get(DataSource);
  await clearDatabase(dataSource);
  await app.close();
});

test('AuthController', async ({ equal }) => {
  const dataSource = app.get(DataSource);
  await clearDatabase(dataSource);

  const mockUser = {
    email: `${createRandomString()}@somesite.com`,
    password: 'Test1234',
  };

  // Test registration and get new registered user
  let user = await testRegisterUser(mockUser, app, equal);

  // Test user requesting new email confirmation
  user = await testResendConfirmEmail(user, app, equal);

  // Test email confirmation and get updated user
  user = await testConfirmEmail(user, app, equal);

  const login = await testLogin(user.email, mockUser.password, equal);
  let accessToken = login.accessToken;
  let refreshToken = login.refreshToken;

  const refresh = await testRefreshToken(accessToken, refreshToken, equal);
  accessToken = refresh.accessToken;
  refreshToken = refresh.refreshToken;

  // Enable 2FA
  const enable2FA = await http.get('/auth/enable2fa', accessToken);
  equal(enable2FA.statusCode, HttpStatus.OK);
  const { secret, qrcode } = enable2FA.body;
  equal(typeof secret === 'string' && secret.length > 0, true);
  equal(typeof qrcode === 'string' && qrcode.length > 0, true);

  // Wrong OTP Verify 2FA
  const wrongVerify2FA = await http.post(
    '/auth/verify2fa',
    { otp: '000000', secret },
    accessToken,
  );
  equal(wrongVerify2FA.statusCode, HttpStatus.UNAUTHORIZED);

  // Verify 2FA
  let otp = authenticator.generate(secret);
  const verify2FA = await http.post(
    '/auth/verify2fa',
    { otp, secret },
    accessToken,
  );
  equal(verify2FA.statusCode, HttpStatus.OK);

  // Logout and login again to test Login with OTP
  const logout = await http.get('/auth/logout', accessToken);
  equal(logout.statusCode, HttpStatus.OK);

  const reLogin = await http.post('/auth/login', {
    email: user.email,
    password: mockUser.password,
  });
  const { twoFactorToken } = reLogin.body;

  // OTP Login with wrong accessToken
  otp = authenticator.generate(secret);
  const wrongLoginOtp = await http.post('/auth/otp', { otp }, accessToken);
  equal(wrongLoginOtp.statusCode, HttpStatus.UNAUTHORIZED);

  // OTP Login with wrong OTP
  const wrongOtp = await http.post('/auth/otp', { otp: '000000' }, accessToken);
  equal(wrongOtp.statusCode, HttpStatus.UNAUTHORIZED);

  // OTP Login with right TwoFactor Access Token
  const loginOtp = await http.post('/auth/otp', { otp }, twoFactorToken);
  equal(loginOtp.statusCode, HttpStatus.OK);
  accessToken = loginOtp.body.accessToken;
  refreshToken = loginOtp.body.refreshToken;

  equal(typeof accessToken === 'string' && accessToken.length > 0, true);
  equal(typeof refreshToken === 'string' && refreshToken.length > 0, true);

  // Disable 2FA
  otp = authenticator.generate(secret);
  const disable2FA = await http.post('/auth/disable2fa', { otp }, accessToken);
  equal(disable2FA.statusCode, HttpStatus.OK);

  // Test Forgot Password
  await testForgotPassword(user, app, equal);

  // // Test login again with old password
  // const oldPasswordLogin = await http.login(user.email, mockUser.password);
  // equal(oldPasswordLogin.statusCode, HttpStatus.UNAUTHORIZED);

  // // Test login again with new password
  // const newPasswordLogin = await http.login(user.email, newPassword);
  // equal(newPasswordLogin.statusCode, HttpStatus.OK);
});

test('AuthController missing Bearer token', async ({ equal }) => {
  const logout = await http.get('/auth/logout');
  equal(logout.statusCode, HttpStatus.UNAUTHORIZED);

  const refresh = await http.get('/auth/refresh-token');
  equal(refresh.statusCode, HttpStatus.UNAUTHORIZED);

  const otp = await http.post('/auth/otp');
  equal(otp.statusCode, HttpStatus.UNAUTHORIZED);

  const enable2fa = await http.get('/auth/enable2fa');
  equal(enable2fa.statusCode, HttpStatus.UNAUTHORIZED);

  const verify2fa = await http.post('/auth/verify2fa');
  equal(verify2fa.statusCode, HttpStatus.UNAUTHORIZED);

  const disable2FA = await http.post('/auth/disable2fa');
  equal(disable2FA.statusCode, HttpStatus.UNAUTHORIZED);
});

const testRegisterUser = async (
  modkUser: { email: string; password: string },
  app: NestFastifyApplication,
  equal: any,
): Promise<User> => {
  const { email, password } = modkUser;
  const wrongPasswords = [
    '1234567', // lower than 8 chars
    '12345678', // only numbers
    'abcdefgh', // only lower case letters
    'ABCDEFGH', // only upper case letters
    'AbcDefgh', // only lower/upper case letters
  ];
  await Promise.all(
    wrongPasswords.map((wrongPassword) =>
      http.post('/auth/register', { email: modkUser.email, wrongPassword }),
    ),
  ).then((responses) =>
    responses.map((res) => equal(res.statusCode, HttpStatus.BAD_REQUEST)),
  );

  // Register user
  const register = await http.post('/auth/register', {
    email,
    password,
  });
  equal(register.statusCode, HttpStatus.CREATED);

  // Check only one user with same email
  const retryregister = await http.post('/auth/register', { email, password });
  equal(retryregister.statusCode, HttpStatus.CONFLICT);

  // Check login before email verification
  const login = await http.login(email, password);
  equal(login.statusCode, HttpStatus.UNAUTHORIZED);
  equal(login.body.message, 'Your account is not active');

  const user = (await app
    .get(UserService)
    .getUserWithUnselected({ email })) as User;

  equal(user.level, 0, 'Level for not confirmed email');
  equal(user.state, UserState.PENDING);
  return user;
};

const testResendConfirmEmail = async (
  user: User,
  app: NestFastifyApplication,
  equal: any,
): Promise<User> => {
  // Test with wrong email
  const wrongEmail = await http.post('/auth/resend-confirm-email', {
    email: 'notexist@email.com',
  });
  // Even with wrong mail, the status code is always 200
  equal(wrongEmail.statusCode, HttpStatus.OK);

  // Set the user has already active
  await app.get(UserService).updateById(user.id, { state: UserState.ACTIVE });
  const activeUser = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(activeUser.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);

  // Set the user has already active
  await app.get(UserService).updateById(user.id, { state: UserState.BANNED });
  const bannedUser = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(bannedUser.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);

  // Restore user previous state
  await app.get(UserService).updateById(user.id, { state: user.state });
  const notEnoughTime = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(notEnoughTime.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);

  // Simulate enough time (5 min) is passed before requesting new email
  await app
    .get(UserService)
    .updateById(user.id, { updatedAt: new Date(Date.now() - 5 * 60 * 1000) });

  const resendEmail = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(resendEmail.statusCode, HttpStatus.OK);

  const updatedUser = await app
    .get(UserService)
    .getUserWithUnselected({ id: user.id });

  return updatedUser as User;
};

const testConfirmEmail = async (
  user: User,
  app: NestFastifyApplication,
  equal: any,
): Promise<User> => {
  const code = user.otpCodes?.[0];
  // Test wrong confirm email code
  const wrongCode = await http.post('/auth/confirm-email', {
    email: user.email,
    code: '000000',
  });
  equal(wrongCode.statusCode, HttpStatus.UNAUTHORIZED);

  // Test right confirm email code
  const confirm = await http.post('/auth/confirm-email', {
    email: user.email,
    code: code?.toString(),
  });
  equal(confirm.statusCode, HttpStatus.OK);

  const updatedUser = (await app
    .get(UserService)
    .getUserWithUnselected({ id: user.id })) as User;

  equal(updatedUser.level, 1, 'Level for confirmed email');
  equal(updatedUser.state, UserState.ACTIVE);
  return updatedUser;
};

const testLogin = async (email: string, password: string, equal: any) => {
  const wrongLogin = await http.login(email, 'wrongpassword');
  equal(wrongLogin.statusCode, HttpStatus.UNAUTHORIZED);

  // Successful login
  const login = await http.login(email, password);
  const accessToken = login.body.accessToken;
  const refreshToken = login.body.refreshToken;

  equal(login.statusCode, HttpStatus.OK);
  equal(typeof accessToken === 'string' && accessToken.length > 0, true);
  equal(typeof refreshToken === 'string' && refreshToken.length > 0, true);
  return { accessToken, refreshToken };
};

const testRefreshToken = async (
  accessToken: string,
  refreshToken: string,
  equal: any,
) => {
  // Try to refresh token with wrong refreshToken
  const wrongRefresh = await http.get('/auth/refresh-token', accessToken);
  equal(wrongRefresh.statusCode, HttpStatus.UNAUTHORIZED);

  // Refresh token with right Refresh Token
  const refresh = await http.get('/auth/refresh-token', refreshToken);
  equal(refresh.statusCode, HttpStatus.OK);

  accessToken = refresh.body.accessToken;
  refreshToken = refresh.body.refreshToken;

  equal(typeof accessToken === 'string' && accessToken.length > 0, true);
  equal(typeof refreshToken === 'string' && refreshToken.length > 0, true);

  return { accessToken, refreshToken };
};

const testForgotPassword = async (
  user: User,
  app: NestFastifyApplication,
  equal: any,
): Promise<string> => {
  // Test with mail that don't exists
  const wrongMail = await http.post('/auth/forgot-password', {
    email: 'notexist@email.com',
  });
  // Even with wrong mail, the status code is always 200
  equal(wrongMail.statusCode, HttpStatus.OK);

  // Test with valid mail
  const forgot = await http.post('/auth/forgot-password', {
    email: user.email,
  });
  equal(forgot.statusCode, HttpStatus.OK);

  const recoveryTokens = await app
    .get(RecoveryTokenService)
    .findAll({ where: { userId: user.id } });
  equal(recoveryTokens.length, 1, 'Should be only one token');
  equal(recoveryTokens[0]!.token.length > 0, true);

  const token = recoveryTokens[0]!.token;

  // Test reset password with wrong code
  const newPassword = 'Abcd1234';
  const wrongToken = await http.post('/auth/reset-password', {
    password: newPassword,
    token: 'wrongtoken',
  });

  equal(wrongToken.statusCode, HttpStatus.UNAUTHORIZED);

  // Test reset password with worng password format
  const wrongPasswords = [
    '1234567', // lower than 8 chars
    '12345678', // only numbers
    'abcdefgh', // only lower case letters
    'ABCDEFGH', // only upper case letters
    'AbcDefgh', // only lower/upper case letters
  ];
  await Promise.all(
    wrongPasswords.map((wrongPassword) =>
      http.post('/auth/reset-password', {
        token,
        wrongPassword,
      }),
    ),
  ).then((responses) =>
    responses.map((res) => equal(res.statusCode, HttpStatus.BAD_REQUEST)),
  );

  // TODO when tap release capture we can spy on hash and test reset password
  // https://github.com/tapjs/tapjs/issues/850
  // Test reset password with right token and right password
  // const rightToken = await http.post('/auth/reset-password', {
  //   password: newPassword,
  //   token,
  // });
  // equal(rightToken.statusCode, HttpStatus.OK);
  return newPassword;
};
