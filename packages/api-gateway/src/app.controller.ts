import { Controller, Get } from '@nestjs/common';
import { EmptyObject } from '../typings/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get('ping')
  ping(): EmptyObject {
    return {};
  }

  @Get('time')
  time(): { serverTime: number } {
    return { serverTime: Date.now() };
  }

  @Get('health')
  @HealthCheck()
  async healtCheck(): Promise<HealthCheckResult> {
    return await this.health.check([
      async () => await this.db.pingCheck('typeorm'),
    ]);
  }
}
