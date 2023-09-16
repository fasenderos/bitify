import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EmptyObject } from '../typings/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiKeyGuard } from './auth/guards/api-key.guard';

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

  @Get('api/test-get')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  testGetApiKeyAuth() {
    return 'OK';
  }

  @Post('api/test-post')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  testPostApiKeyAuth() {
    return 'OK';
  }
}
