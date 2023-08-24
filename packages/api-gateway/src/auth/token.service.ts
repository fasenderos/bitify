import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenTypes } from '../config';
import { ConfigService } from '@nestjs/config';

export interface IJwtPayload {
  iss: string;
  sub: string;
  jti: string;
  type: string;
  iat: number;
}

@Injectable()
export class TokenService {
  APP_NAME: string;
  ACCESS_SECRET: string;
  REFRESH_SECRET: string;
  EXP_ACCESS: string;
  EXP_REFRESH: string;

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
    this.EXP_ACCESS = this.config.get<string>('auth.expAccessToken') as string;
    this.EXP_REFRESH = this.config.get<string>(
      'auth.expRefreshToken',
    ) as string;
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

  decode(token: string): IJwtPayload {
    return this.jwt.decode(token.replace('Bearer ', ''), {
      json: true,
    }) as IJwtPayload;
  }
}
