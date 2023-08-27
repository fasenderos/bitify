import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { User } from '../user/entities/user.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { CipherService } from '../common/modules/cipher/cipher.service';

export interface I2FAResponse {
  twoFactorToken: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  APP_NAME: string;

  constructor(
    private readonly session: SessionService,
    private readonly token: TokenService,
    private readonly user: UserService,
    private readonly cipher: CipherService,
    private readonly config: ConfigService,
  ) {
    this.APP_NAME = this.config.get<string>('app.name') as string;
  }

  async register(email: string, password: string): Promise<void> {
    await this.user.createUser({ email, password });
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
    if (!user || !user.otpSecret || !user.otp)
      throw new ForbiddenException('Wrong OTP configuration');

    const userSecret = this.cipher.decrypt(user.otpSecret);
    const isValid = this.isOTPValid(otp, userSecret);

    if (!isValid)
      throw new ForbiddenException(
        'The provided one time password is not valid',
      );
  }

  async enable2FA(user: User) {
    // Generate secret for this user
    const secret = authenticator.generateSecret();
    // Generate otpauth uri
    const otpauth = authenticator.keyuri(user.email, this.APP_NAME, secret);
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

  async verify2FA(userId: string, dto: Verify2FADto): Promise<void> {
    const isValid = this.isOTPValid(dto.otp, dto.secret);
    if (!isValid)
      throw new ForbiddenException(
        'The provided one time password is not valid',
      );

    // Save secret (encrypted) to db and enable 2FA
    await this.user.updateById(userId, {
      otp: true,
      otpSecret: this.cipher.encrypt(dto.secret),
    });
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
}
