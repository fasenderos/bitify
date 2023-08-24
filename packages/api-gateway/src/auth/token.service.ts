import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenTypes } from '../config';
import { ConfigService } from '@nestjs/config';

export interface IJwt2FAToken {
  iss: string;
  sub: string;
  type: string;
  iat: number;
}
export interface IJwtPayload extends IJwt2FAToken {
  jti: string;
}

@Injectable()
export class TokenService {
  APP_NAME: string;
  ACCESS_SECRET: string;
  REFRESH_SECRET: string;
  TWO_FACTOR_SECRET: string;
  EXP_ACCESS: string;
  EXP_REFRESH: string;
  EXP_TWO_FACTOR: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.APP_NAME = this.config.get<string>('app.name') as string;
    this.ACCESS_SECRET = this.config.get<string>(
      'auth.secretAccessToken',
    ) as string;
    this.REFRESH_SECRET = this.config.get<string>(
      'auth.secretRefreshToken',
    ) as string;
    this.TWO_FACTOR_SECRET = this.config.get<string>(
      'auth.secret2FAToken',
    ) as string;
    this.EXP_ACCESS = this.config.get<string>('auth.expAccessToken') as string;
    this.EXP_REFRESH = this.config.get<string>(
      'auth.expRefreshToken',
    ) as string;
    this.EXP_TWO_FACTOR = this.config.get<string>('auth.exp2FAToken') as string;
  }

  async generateAccessToken(
    userId: string,
    sessionId: string,
    now: number,
  ): Promise<string> {
    const payload: IJwtPayload = {
      iss: this.APP_NAME,
      sub: userId,
      jti: sessionId,
      type: TokenTypes.ACCESS,
      iat: now,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.ACCESS_SECRET,
      expiresIn: this.EXP_ACCESS,
    });
    return accessToken;
  }

  async generateRefreshToken(
    userId: string,
    sessionId: string,
    now: number,
  ): Promise<string> {
    const payload: IJwtPayload = {
      iss: this.APP_NAME,
      sub: userId,
      jti: sessionId,
      type: TokenTypes.ACCESS,
      iat: now,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.REFRESH_SECRET,
      expiresIn: this.EXP_REFRESH,
    });
    return accessToken;
  }

  async generate2FAToken(userId: string): Promise<string> {
    const payload: IJwt2FAToken = {
      iss: this.APP_NAME,
      sub: userId,
      type: TokenTypes.ACCESS,
      iat: Date.now(),
    };
    const twoFactorToken = await this.jwt.signAsync(payload, {
      secret: this.TWO_FACTOR_SECRET,
      expiresIn: this.EXP_TWO_FACTOR,
    });
    return twoFactorToken;
  }

  decode(token: string): IJwtPayload {
    return this.jwt.decode(token.replace('Bearer ', ''), {
      json: true,
    }) as IJwtPayload;
  }
}
