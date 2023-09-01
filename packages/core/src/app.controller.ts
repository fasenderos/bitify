import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  ping(): Record<string, never> {
    return {};
  }
}
