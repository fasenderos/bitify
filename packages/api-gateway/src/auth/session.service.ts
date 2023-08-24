import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { ConfigService } from '@nestjs/config';
import timestring from 'timestring';

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

  async createSession(userId: string, now: number): Promise<Session> {
    const expires = new Date(now + this.EXP_MS_REFRESH);
    const session = await this.session.insert({ userId, expires });
    return session.raw[0];
  }

  async refreshSession(sessionId: string, now: number): Promise<void> {
    const expires = new Date(now + this.EXP_MS_REFRESH);
    await this.session.update({ id: sessionId }, { expires });
  }

  public findById(sessionId: string) {
    return this.session.findOneBy({ id: sessionId });
  }

  public async deleteById(id: string): Promise<void> {
    await this.session.delete(id);
  }
}
