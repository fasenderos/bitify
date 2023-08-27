import { Controller, Get } from '@nestjs/common';
import { EmptyObject } from '../typings/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @ApiOperation({ description: 'Test Connectivity' })
  @ApiOkResponse({ description: 'Return a ping frame {}.' })
  @Get('ping')
  ping(): EmptyObject {
    return {};
  }

  @ApiOperation({ description: 'Check server time' })
  @ApiOkResponse({
    description: 'Return object with the shape { serverTime: number }',
  })
  @Get('time')
  time(): { serverTime: number } {
    return { serverTime: Date.now() };
  }

  @ApiOperation({ description: 'Check server status' })
  @Get('health')
  @HealthCheck()
  async healtCheck(): Promise<HealthCheckResult> {
    return await this.health.check([
      async () => await this.db.pingCheck('typeorm'),
    ]);
  }
}
