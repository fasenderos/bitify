import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { User } from '../users/entities/user.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { CipherService } from '../common/modules/cipher/cipher.service';
import { I2FAResponse, IEnable2FAResponse, ILoginResponse } from './interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ActivityRecord,
  ActivityRecordDto,
  EmailConfirmation,
  EmailConfirmationDto,
  EmailResetPassword,
  EmailResetPasswordDto,
} from '../events';
import timestring from 'timestring';
import { UserState } from '../common/constants';
import { RecoveryTokensService } from '../recovery-tokens/recovery-tokens.service';
import { createRandomString, isExpired } from '../common/utils';
import { hash } from 'bcrypt';
import { BaseTransaction } from '../base/base.transaction';
import { DataSource, EntityManager } from 'typeorm';
import { RecoveryToken } from '../recovery-tokens/entities/recovery-token.entity';
import { request } from 'undici';

interface ResetPasswordTransactionInput {
  userId: string;
  password: string;
  hashedToken: string;
}

@Injectable()
export class ResetPasswordTransaction extends BaseTransaction<
  ResetPasswordTransactionInput,
  void
> {
  constructor(connection: DataSource) {
    super(connection);
  }

  // Run reset password in transaction to prevent race conditions.
  protected async execute(
    data: ResetPasswordTransactionInput,
    manager: EntityManager,
  ): Promise<any> {
    const { userId, password, hashedToken } = data;
    // Get all user recovery tokens from DB
    const allUsertokens = await manager.find(RecoveryToken, {
      where: { userId },
    });
    const token = allUsertokens.find((x) => x.token === hashedToken);
    if (!token)
      // The token was redeemed by another transaction
      throw new UnprocessableEntityException('Invalid password reset token');

    // Delete all tokens belonging to this user to prevent duplicate use
    await manager.delete(RecoveryToken, { userId });
    // Check if the current token has expired or not
    if (token.expiresAt.getTime() < Date.now())
      throw new UnprocessableEntityException(
        'Your password reset oken has expired. Please try again',
      );

    // All checks have been completed. We can change the user’s password
    const passwordHash = await hash(password, 10);
    await manager.update(User, { id: userId }, { passwordHash });
  }
}

@Injectable()
export class AuthService {
  appName: string;
  expVerifyMail: number;
  expResetPassword: number;
  recaptchaSecret: string;

  constructor(
    private readonly resetPasswordTransaction: ResetPasswordTransaction,
    private readonly recoveryToken: RecoveryTokensService,
    private readonly session: SessionService,
    private readonly token: TokenService,
    private readonly user: UsersService,
    private readonly cipher: CipherService,
    private readonly config: ConfigService,
    private readonly event: EventEmitter2,
  ) {
    this.appName = this.config.get<string>('app.name') as string;
    this.expVerifyMail = timestring(
      this.config.get<string>('auth.expVerifyMail') as string,
      'ms',
    );
    this.expResetPassword = timestring(
      this.config.get<string>('auth.expResetPassword') as string,
      'ms',
    );
    this.recaptchaSecret = this.config.get<string>(
      'auth.recaptchaSecret',
    ) as string;
  }

  async register(
    email: string,
    password: string,
    userIP: string,
    userAgent: string,
    recaptchaToken?: string,
  ): Promise<void> {
    if (this.recaptchaSecret)
      await this.validateCaptcha(userIP, recaptchaToken);

    const code = this.createPinCode();
    const result = await this.user.createUser({
      email,
      password,
      verifyCode: this.cipher.encrypt(code),
      verifyExpire: new Date(Date.now() + this.expVerifyMail),
    });
    // If no error happens we have the insertedId
    const insertedId = result.identifiers[0]?.['id'];
    if (!insertedId) throw new BadRequestException('Account creation failed');

    const payload: EmailConfirmationDto = { email, code };
    this.event.emit(EmailConfirmation, payload);

    const activity: ActivityRecordDto = {
      userId: insertedId,
      userIP,
      userAgent,
      action: 'signup',
      result: 'succeed',
      topic: 'account',
    };
    this.event.emit(ActivityRecord, activity);
  }

  async login(
    email: string,
    password: string,
    userIP: string,
    recaptchaToken?: string,
  ): Promise<ILoginResponse | I2FAResponse> {
    if (this.recaptchaSecret)
      await this.validateCaptcha(userIP, recaptchaToken);

    const user = await this.user.validateUserPassword(email, password);
    if (user.otp && user.otpSecret) {
      const twoFactorToken = await this.token.generate2FAToken(user.id);
      return { twoFactorToken };
    }
    return this.finalizeLogin(user.id);
  }

  async finalizeLogin(userId: string): Promise<ILoginResponse> {
    const now = Date.now();
    const session = await this.session.createSession(userId, now);
    const { accessToken, refreshToken } = await this.createTokens(
      userId,
      session.id,
      now,
    );
    return { accessToken, refreshToken };
  }

  async logout(auth: string): Promise<void> {
    const jwt = this.token.decode(auth);
    await this.session.deleteById(jwt.jti);
  }

  async refreshToken(auth: string): Promise<ILoginResponse> {
    const jwt = this.token.decode(auth);
    const now = Date.now();
    const { accessToken, refreshToken } = await this.createTokens(
      jwt.sub,
      jwt.jti,
      now,
    );
    await this.session.refreshSession(jwt.jti, now);
    return { accessToken, refreshToken };
  }

  async verifyOTP(userId: string, otp: string): Promise<void> {
    const user = await this.user.getUserWithUnselected({ id: userId });
    if (!user || !user.otpSecret || !user.otp)
      throw new UnauthorizedException('Wrong OTP configuration');

    const userSecret = this.cipher.decrypt(user.otpSecret);
    const isValid = this.isOTPValid(otp, userSecret);

    if (!isValid)
      throw new UnauthorizedException(
        'The provided one time password is not valid',
      );
  }

  async enable2FA(user: User): Promise<IEnable2FAResponse> {
    // Generate secret for this user
    const secret = authenticator.generateSecret();
    // Generate otpauth uri
    const otpauth = authenticator.keyuri(user.email, this.appName, secret);
    // Create QR Code from otpauth
    const qrcode = await toDataURL(otpauth);
    return {
      secret,
      qrcode,
    };
  }

  async disable2FA(userId: string): Promise<void> {
    await this.user.updateById(userId, {
      otp: false,
      otpSecret: null,
    });
  }

  async verify2FA(userId: string, dto: Verify2FADto): Promise<void> {
    const isValid = this.isOTPValid(dto.otp, dto.secret);
    if (!isValid)
      throw new UnauthorizedException(
        'The provided one time password is not valid',
      );

    // Save secret (encrypted) to db and enable 2FA
    await this.user.updateById(userId, {
      otp: true,
      otpSecret: this.cipher.encrypt(dto.secret),
    });
  }

  async forgotPassword(email: string) {
    const user = await this.user.findByEmail(email);
    // If not found or is banned return without providing any error to frontend
    if (!user || user.state === UserState.BANNED) return;

    // Prevent multiple resetting password request
    const allUserTokens = await this.recoveryToken.find({
      where: { userId: user.id },
    });

    // TODO improve this logic by checking creation time
    if (allUserTokens.length > 5) {
      await this.user.updateById(user.id, { state: UserState.BANNED });
      return;
    }

    const token = createRandomString();
    const hashedToken = await hash(token, 10);
    const tokenEntity = this.recoveryToken.createEntity(
      {
        token: hashedToken,
        expiresAt: new Date(Date.now() + this.expResetPassword),
      },
      user.id,
    );
    await this.recoveryToken.save(tokenEntity);
    const payload: EmailResetPasswordDto = {
      token,
      email,
    };
    this.event.emit(EmailResetPassword, payload);
  }

  async resetPassword(
    password: string,
    token: string,
    userIP: string,
    userAgent: string,
  ): Promise<void> {
    const hashedToken = await hash(token, 10);
    const exist = await this.recoveryToken.findOne({
      token: hashedToken,
    });
    if (!exist) throw new UnauthorizedException('Invalid password reset token');

    // Now we know that the token exists, so it is valid. We start a
    // transaction to prevent race conditions.
    await this.resetPasswordTransaction.run({
      userId: exist.userId,
      password,
      hashedToken,
    });

    const activity: ActivityRecordDto = {
      userId: exist.userId,
      userIP,
      userAgent,
      topic: 'password',
      action: 'password.reset',
      result: 'succeed',
    };
    this.event.emit(ActivityRecord, activity);
  }

  async confirmEmail(email: string, code: string): Promise<void> {
    const user = await this.user.getUserWithUnselected({ email, level: 0 });
    const verifyCode = user?.verifyCode
      ? this.cipher.decrypt(user.verifyCode)
      : null;
    if (!user || verifyCode !== code)
      throw new UnauthorizedException(
        'You have entered an invalid verification code',
      );

    if (
      user.verifyExpire == null ||
      isExpired(user.verifyExpire, this.expVerifyMail)
    )
      throw new UnauthorizedException('Your verification code is expired');

    await this.user.updateById(user.id, {
      level: 1,
      state: UserState.ACTIVE,
      verifyCode: null,
      verifyExpire: null,
    });
  }

  async resendConfirmEmail(email: string): Promise<void> {
    const user = await this.user.findByEmail(email);
    if (!user) return;

    if (user.state === UserState.ACTIVE)
      throw new UnprocessableEntityException(
        'Your account has already been activated.',
      );

    if (user.state === UserState.BANNED)
      throw new UnprocessableEntityException(
        'Sorry, your account is banned. Contact us for more information.',
      );

    // Wait 5 minutes before request new email varification code
    // We check on updatedAt because at this user state,
    // only the resendConfirmEmail method can update user
    if (!isExpired(user.updatedAt, 5 * 60 * 1000)) {
      throw new UnprocessableEntityException(
        'An email has already been sent. Wait 5 minutes before requesting new one.',
      );
    }

    const code = this.createPinCode();
    await this.user.updateById(user.id, {
      verifyCode: this.cipher.encrypt(code),
      verifyExpire: new Date(Date.now() + this.expVerifyMail),
    });
    this.event.emit(EmailConfirmation, { email, code });
  }

  private async validateCaptcha(ip: string, token?: string): Promise<void> {
    // If missing public site token
    if (!token)
      throw new BadRequestException('Missing Google reCAPTCHA Site key.');

    const { body } = await request(
      `https://www.google.com/recaptcha/api/siteverify?secret=${this.recaptchaSecret}&response=${token}&remoteip=${ip}`,
    );
    // https://developers.google.com/recaptcha/docs/verify
    const response = (await body.json()) as {
      success: boolean;
      challenge_ts: number; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
      hostname: string; // the hostname of the site where the reCAPTCHA was solved
      'error-codes'?: string[]; // optional
    };

    if (!response.success)
      throw new UnprocessableEntityException(
        'Captcha verification failed, please try again.',
      );
  }

  private isOTPValid(otp: string, secret: string): boolean {
    return authenticator.verify({
      token: otp,
      secret: secret,
    });
  }

  private async createTokens(
    userId: string,
    sessionId: string,
    now: number,
  ): Promise<ILoginResponse> {
    const tokens = await Promise.all([
      this.token.generateAccessToken(userId, sessionId, now),
      this.token.generateRefreshToken(userId, sessionId, now),
    ]);
    return { accessToken: tokens[0], refreshToken: tokens[1] };
  }

  private createPinCode(): string {
    return Math.random().toString().substring(2, 8);
  }
}
