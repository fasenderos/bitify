import { test } from 'tap';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { HttpStatus } from '@nestjs/common';
import { authenticator } from 'otplib';
import { createRandomString } from '../../src/common/utils';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/entities/user.entity';
import { UserState } from '../../src/common/constants';
import { RecoveryTokensService } from '../../src/recovery-tokens/recovery-tokens.service';
import { CipherService } from '../../src/common/modules/cipher/cipher.service';
import { buildServer, createUser } from '../helper';
import { HttpClient } from '../http-client';
import { SessionService } from '../../src/auth/session.service';
import { TokenService } from '../../src/auth/token.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResetPasswordTransaction } from '../../src/auth/transactions/reset-password.transaction';

test('AuthController', async ({ equal, mock, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());
  const http = new HttpClient(app);

  const mockUser = {
    email: `${createRandomString()}@somesite.com`,
    password: 'Test1234',
  };

  // Test registration and get new registered user
  let user = await testRegisterUser(mockUser, app, equal, http);

  // Test user requesting new email confirmation
  user = await testResendConfirmEmail(user, app, equal, http);

  // Test email confirmation and get updated user
  user = await testConfirmEmail(user, app, equal, http);

  const login = await testLogin(user, mockUser.password, equal, app, http);
  let accessToken = login.accessToken;
  let refreshToken = login.refreshToken;

  const refresh = await testRefreshToken(
    accessToken,
    refreshToken,
    equal,
    http,
  );
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

  const reLogin = await http.login(user.email, mockUser.password);
  const { twoFactorToken } = reLogin.body;

  // OTP Login with wrong accessToken
  otp = authenticator.generate(secret);
  const wrongLoginOtp = await http.post('/auth/otp', { otp }, accessToken);
  equal(wrongLoginOtp.statusCode, HttpStatus.UNAUTHORIZED);

  // OTP Login with wrong OTP
  const wrongOtp = await http.post(
    '/auth/otp',
    { otp: '000000' },
    twoFactorToken,
  );
  equal(wrongOtp.statusCode, HttpStatus.UNAUTHORIZED);

  // Test wrong OTP configuration
  {
    const userService = app.get(UsersService);
    const userPrev = await userService.getUserWithUnselected({ id: user.id });
    {
      // Set user as deleted so the user can't be found
      await userService.updateById(user.id, { deletedAt: new Date() });
      // Try to perform a valid OTP Login
      const loginOtp = await http.post('/auth/otp', { otp }, twoFactorToken);
      equal(loginOtp.statusCode, HttpStatus.UNAUTHORIZED);
    }
    {
      // Set otpSecret to null and restore deleted
      await userService.updateById(user.id, {
        deletedAt: null,
        otpSecret: null,
      });
      // Try to perform a valid OTP Login
      const loginOtp = await http.post('/auth/otp', { otp }, twoFactorToken);
      equal(loginOtp.statusCode, HttpStatus.UNAUTHORIZED);
    }
    {
      // Set otp to disabled and restore otpSecret
      await userService.updateById(user.id, {
        otp: false,
        otpSecret: userPrev?.otpSecret as string,
      });
      // Try to perform a valid OTP Login
      const loginOtp = await http.post('/auth/otp', { otp }, twoFactorToken);
      equal(loginOtp.statusCode, HttpStatus.UNAUTHORIZED);
    }
    // Restore user otp enabled so the OTP test can continue
    await userService.updateById(user.id, {
      otp: true,
    });
  }

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
  const newPassword = await testForgotPassword(user, app, equal, mock, http);

  // Test login again with old password
  const oldPasswordLogin = await http.login(user.email, mockUser.password);
  equal(oldPasswordLogin.statusCode, HttpStatus.UNAUTHORIZED);

  // Test login again with new password
  const newPasswordLogin = await http.login(user.email, newPassword);
  equal(newPasswordLogin.statusCode, HttpStatus.OK);
});

test('AuthController missing Bearer token', async ({ equal, teardown }) => {
  const app = await buildServer();
  teardown(async () => await app.close());
  const http = new HttpClient(app);

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
  mockUser: { email: string; password: string },
  app: NestFastifyApplication,
  equal: any,
  http: HttpClient,
): Promise<User> => {
  const { email, password } = mockUser;
  const wrongPasswords = [
    '1234567', // lower than 8 chars
    '12345678', // only numbers
    'abcdefgh', // only lower case letters
    'ABCDEFGH', // only upper case letters
    'AbcDefgh', // only lower/upper case letters
  ];
  await Promise.all(
    wrongPasswords.map((wrongPassword) =>
      http.post('/auth/register', {
        email: mockUser.email,
        wrongPassword,
        recaptchaToken: 'somerecaptchatoken',
      }),
    ),
  ).then((responses) =>
    responses.map((res) => equal(res.statusCode, HttpStatus.BAD_REQUEST)),
  );

  {
    // When env RECAPTCHA_PRIVATE_KEY is set, the registration should fail without a recaptcha token
    if (process.env['RECAPTCHA_PRIVATE_KEY']) {
      const register = await http.post('/auth/register', {
        email,
        password,
      });
      equal(register.statusCode, HttpStatus.BAD_REQUEST);
    }
  }

  // Register user
  const register = await http.post('/auth/register', {
    email,
    password,
    recaptchaToken: 'somerecaptchatoken',
  });
  equal(register.statusCode, HttpStatus.CREATED);

  // Check only one user with same email
  const retryRegister = await http.post('/auth/register', {
    email,
    password,
    recaptchaToken: 'somerecaptchatoken',
  });
  equal(retryRegister.statusCode, HttpStatus.CONFLICT);

  // Check login before email verification
  const login = await http.login(email, password);
  equal(login.statusCode, HttpStatus.UNAUTHORIZED);
  equal(login.body.message, 'Your account is not active');

  const user = (await app
    .get(UsersService)
    .getUserWithUnselected({ email })) as User;

  equal(user.level, 0, 'Level for not confirmed email');
  equal(user.state, UserState.PENDING);
  return user;
};

const testResendConfirmEmail = async (
  user: User,
  app: NestFastifyApplication,
  equal: any,
  http: HttpClient,
): Promise<User> => {
  // Test with wrong email
  const wrongEmail = await http.post('/auth/resend-confirm-email', {
    email: 'notexist@email.com',
  });
  // Even with wrong mail, the status code is always 200
  equal(wrongEmail.statusCode, HttpStatus.OK);

  // Set the user has already active
  await app.get(UsersService).updateById(user.id, { state: UserState.ACTIVE });
  const activeUser = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(activeUser.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);

  // Set the user has banned
  await app.get(UsersService).updateById(user.id, { state: UserState.BANNED });
  const bannedUser = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(bannedUser.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);

  // Restore user previous state
  await app.get(UsersService).updateById(user.id, { state: user.state });
  const notEnoughTime = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(notEnoughTime.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);

  // Simulate enough time (5 min) is passed before requesting new email
  await app
    .get(UsersService)
    .updateById(user.id, { updatedAt: new Date(Date.now() - 5 * 60 * 1000) });

  const resendEmail = await await http.post('/auth/resend-confirm-email', {
    email: user.email,
  });
  equal(resendEmail.statusCode, HttpStatus.OK);

  const updatedUser = await app
    .get(UsersService)
    .getUserWithUnselected({ id: user.id });

  return updatedUser as User;
};

const testConfirmEmail = async (
  user: User,
  app: NestFastifyApplication,
  equal: any,
  http: HttpClient,
): Promise<User> => {
  // With e2e we can't test if the user has received the mail so we decrypt the code saved in DB
  // assuming that an email as always been sent.
  const cipher = app.get(CipherService);
  const code = cipher.decrypt(user.verifyCode as string);
  // Test wrong confirm email code
  const wrongCode = await http.post('/auth/confirm-email', {
    email: user.email,
    code: '000000',
  });
  equal(wrongCode.statusCode, HttpStatus.UNAUTHORIZED);

  {
    // Test verification code expired
    const userService = app.get(UsersService);
    {
      // Test when verifyExpire is null
      await userService.updateById(user.id, { verifyExpire: null });
      const confirm = await http.post('/auth/confirm-email', {
        email: user.email,
        code,
      });
      equal(confirm.statusCode, HttpStatus.UNAUTHORIZED);
    }
    {
      // Test when verifyExpire is date lower then 8 minutes
      // Verification code expires in 8 minutes
      await userService.updateById(user.id, {
        verifyExpire: new Date(Date.now() - 60 * 9 * 1000),
      });
      const confirm = await http.post('/auth/confirm-email', {
        email: user.email,
        code,
      });
      equal(confirm.statusCode, HttpStatus.UNAUTHORIZED);
    }
    // Restore previous expires
    await userService.updateById(user.id, {
      verifyExpire: user.verifyExpire,
    });
  }

  // Test right confirm email code
  const confirm = await http.post('/auth/confirm-email', {
    email: user.email,
    code,
  });
  equal(confirm.statusCode, HttpStatus.OK);

  const updatedUser = (await app
    .get(UsersService)
    .getUserWithUnselected({ id: user.id })) as User;

  equal(updatedUser.level, 1, 'Level for confirmed email');
  equal(updatedUser.state, UserState.ACTIVE);
  return updatedUser;
};

const testLogin = async (
  user: User,
  password: string,
  equal: any,
  app: NestFastifyApplication,
  http: HttpClient,
) => {
  const { state: prevState, email, id } = user;
  // Wrong Email
  const wrongEmail = await http.login('some@mail.com', password);
  equal(wrongEmail.statusCode, HttpStatus.UNAUTHORIZED);
  // Wrong Password
  const wrongPwd = await http.login(email, 'wrongpassword');
  equal(wrongPwd.statusCode, HttpStatus.UNAUTHORIZED);

  const userService = app.get(UsersService);
  {
    // Try login for user in pending state
    await userService.updateById(id, { state: UserState.PENDING });
    const login = await http.login(email, password);
    equal(login.statusCode, HttpStatus.UNAUTHORIZED);
  }

  {
    // Try login for banned user
    await userService.updateById(id, { state: UserState.BANNED });
    const login = await http.login(email, password);
    equal(login.statusCode, HttpStatus.UNAUTHORIZED);
  }

  {
    // Set an invalid user state
    await userService.updateById(id, { state: 3 });
    const login = await http.login(email, password);
    equal(login.statusCode, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // Restore previouse user state
  await userService.updateById(id, { state: prevState });

  {
    // When env RECAPTCHA_PRIVATE_KEY is set, login should fail without a recaptcha token
    if (process.env['RECAPTCHA_PRIVATE_KEY']) {
      const register = await http.post('/auth/login', {
        email,
        password,
      });
      equal(register.statusCode, HttpStatus.BAD_REQUEST);
    }
  }

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
  http: HttpClient,
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
  mock: any,
  http: HttpClient,
): Promise<string> => {
  const mockRecoveryToken = 'somerecoverytoken';
  const resetPasswordTransaction = app.get(ResetPasswordTransaction);
  const recoveryToken = app.get(RecoveryTokensService);
  const sessionService = app.get(SessionService);
  const tokenService = app.get(TokenService);
  const userService = app.get(UsersService);
  const cipherService = app.get(CipherService);
  const configService = app.get(ConfigService);
  const eventEmitter = app.get(EventEmitter2);
  const { AuthService } = mock('../../src/auth/auth.service', {
    '../../src/common/utils': {
      createRandomString: () => mockRecoveryToken,
    },
  });
  const mockAuthService = new AuthService(
    resetPasswordTransaction,
    recoveryToken,
    sessionService,
    tokenService,
    userService,
    cipherService,
    configService,
    eventEmitter,
  );

  // Test with mail that don't exists
  const wrongMail = await http.post('/auth/forgot-password', {
    email: 'notexist@email.com',
  });
  // Even with wrong mail, the status code is always 200
  equal(wrongMail.statusCode, HttpStatus.OK);

  // Test multiple forgot password reset
  {
    const { user: newUser } = await createUser(app);
    // After 5 request user must be banned
    let i = 6;
    while (i--) {
      await http.post('/auth/forgot-password', {
        email: newUser.email,
      });
    }
    const bannedUser = await userService.findById(newUser.id);
    equal(bannedUser?.state, UserState.BANNED);
    // Now user is banned and api return always status 200
    const response = await http.post('/auth/forgot-password', {
      email: user.email,
    });
    equal(response.statusCode, HttpStatus.OK);
  }

  // Test with valid mail. We need to use the mock for getting
  // the recovery token
  await mockAuthService.forgotPassword(user.email);

  // Test reset password with wrong code
  const newPassword = 'Abcd1234';
  const wrongToken = await http.post('/auth/reset-password', {
    token: 'wrongRecoveryToken',
    password: newPassword,
    email: user.email,
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
        token: mockRecoveryToken,
        password: wrongPassword,
        email: user.email,
      }),
    ),
  ).then((responses) =>
    responses.map((res) => equal(res.statusCode, HttpStatus.BAD_REQUEST)),
  );

  // Test reset password with right token and right password
  const rightToken = await http.post('/auth/reset-password', {
    token: mockRecoveryToken,
    password: newPassword,
    email: user.email,
  });
  equal(rightToken.statusCode, HttpStatus.OK);
  return newPassword;
};
