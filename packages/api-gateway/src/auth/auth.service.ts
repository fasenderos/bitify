import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { User } from '../user/entities/user.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { CipherService } from '../common/modules/cipher/cipher.service';
import { randomInt } from 'crypto';
import { I2FAResponse, I2FaEnabled, ILoginResponse } from './interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailConfirmation } from '../events';
import timestring from 'timestring';
import { UserStatus } from '../common/constants';

@Injectable()
export class AuthService {
  appName: string;
  expVerifyMail: number;

  constructor(
    private readonly session: SessionService,
    private readonly token: TokenService,
    private readonly user: UserService,
    private readonly cipher: CipherService,
    private readonly config: ConfigService,
    private readonly event: EventEmitter2,
  ) {
    this.appName = this.config.get<string>('app.name') as string;
    this.expVerifyMail = timestring(
      this.config.get<string>('auth.expVerifyMail') as string,
      'ms',
    );
  }

  async register(email: string, password: string): Promise<void> {
    const code = this.createPinCode();
    await this.user.createUser({ email, password, otpCodes: [code] });
    this.event.emit(EmailConfirmation, { email, code });
  }

  async login(
    email: string,
    password: string,
  ): Promise<ILoginResponse | I2FAResponse> {
    const user = await this.user.validateUserPassword(email, password);
    if (user.otp && user.otpSecret) {
      const twoFactorToken = await this.token.generate2FAToken(user.id);
      return { twoFactorToken };
    }
    return this.finalizeLogin(user.id);
  }

  async finalizeLogin(userId: string) {
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

  async verifyOTP(userId: string, otp: string) {
    const user = await this.user.getUserWithUnselected({ id: userId });
    if (!user || !user.otpSecret || !user.otp || !user.otpCodes)
      throw new UnauthorizedException('Wrong OTP configuration');

    // Check if one of the OTP backUp code has been used
    // TODO if so we have to remove the used one and/or recreate one/ten new OTP Code??
    if (user.otpCodes.includes(parseInt(otp))) return;

    const userSecret = this.cipher.decrypt(user.otpSecret);
    const isValid = this.isOTPValid(otp, userSecret);

    if (!isValid)
      throw new UnauthorizedException(
        'The provided one time password is not valid',
      );
  }

  async enable2FA(user: User) {
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

  async disable2FA(userId: string) {
    await this.user.updateById(userId, {
      otp: false,
      otpSecret: null,
    });
  }

  async verify2FA(userId: string, dto: Verify2FADto): Promise<I2FaEnabled> {
    const isValid = this.isOTPValid(dto.otp, dto.secret);
    if (!isValid)
      throw new UnauthorizedException(
        'The provided one time password is not valid',
      );

    // Fixed OTP Code that can be used to bypass the OTP
    const otpCodes = new Array(10).map(this.createPinCode);

    // Save secret (encrypted) to db and enable 2FA
    await this.user.updateById(userId, {
      otp: true,
      otpSecret: this.cipher.encrypt(dto.secret),
      otpCodes,
    });
    return { otpCodes };
  }

  async confirmEmail(email: string, code: number) {
    const user = await this.user.getUserWithUnselected({ email, level: 0 });

    if (!user || user.otpCodes?.includes(code))
      throw new UnauthorizedException(
        'You have entered an invalid verification code',
      );

    const codeExpired =
      Date.now() - user.updatedAt.getTime() > this.expVerifyMail;
    if (codeExpired)
      throw new UnauthorizedException('Your verification code is expired');

    await this.user.updateById(user.id, {
      level: 1,
      state: UserStatus.ACTIVE,
      otpCodes: null,
    });
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

  private createPinCode(): number {
    return randomInt(100000, 999999);
  }
}
