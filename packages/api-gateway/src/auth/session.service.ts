import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { ConfigService } from '@nestjs/config';
import timestring from 'timestring';
import { BaseService } from '../base/base.service';

interface ISessionCreate {
  userId: string;
  userIp: string;
  now: number;
}

@Injectable()
export class SessionService extends BaseService<Session> {
  EXP_MS_REFRESH: number;

  constructor(
    @InjectRepository(Session)
    private readonly session: Repository<Session>,
    private readonly configService: ConfigService,
  ) {
    super(session);
    const expRefreshToken = this.configService.get<string>(
      'auth.expRefreshToken',
    ) as string;
    this.EXP_MS_REFRESH = timestring(expRefreshToken, 'ms');
  }

  async createSession({
    userId,
    userIp,
    now,
  }: ISessionCreate): Promise<Session> {
    const expires = new Date(now + this.EXP_MS_REFRESH);
    const session = await this.session.insert({ userId, userIp, expires });
    return session.raw[0];
  }
}
