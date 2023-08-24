import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from '../user/user.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

export interface ISignInResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly session: SessionService,
    private readonly token: TokenService,
    private readonly user: UserService,
  ) {}

  async signUp(email: string, password: string): Promise<void> {
    await this.user.createUser({ email, password });
  }

  async signIn(
    email: string,
    password: string,
    userIp: string,
  ): Promise<ISignInResponse> {
    const user = await this.user.getUserByEmail(email);
    if (user == null)
      throw new UnauthorizedException(
        'You have entered an invalid email or password',
      );

    const match = await compare(password, user.passwordHash);
    if (!match)
      throw new UnauthorizedException(
        'You have entered an invalid email or password',
      );

    const now = Date.now();
    const accessToken = await this.token.generateAccessToken(user.id, now);
    const refreshToken = await this.token.generateRefreshToken(user.id, now);
    await this.session.createSession({
      userId: user.id,
      userIp,
      token: refreshToken,
      now,
    });
    return { accessToken, refreshToken };
  }
}
