import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { ConfigService } from '@nestjs/config';
import timestring from 'timestring';

interface ISessionCreate {
  userId: string;
  userIp: string;
  token: string;
  now: number;
}

@Injectable()
export class SessionService {
  EXP_MS_REFRESH: number;

  constructor(
    @InjectRepository(Session)
    private readonly session: Repository<Session>,
    private readonly configService: ConfigService,
  ) {
    const expRefreshToken = this.configService.get<string>(
      'auth.expRefreshToken',
    ) as string;
    this.EXP_MS_REFRESH = timestring(expRefreshToken, 'ms');
  }

  async createSession({
    userId,
    userIp,
    token,
    now,
  }: ISessionCreate): Promise<void> {
    const expires = new Date(now + this.EXP_MS_REFRESH);
    await this.session.insert({ userId, userIp, expires, token });
  }
}
