import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  public async findAll(): Promise<User[]> {
    return await this.service.findAll();
  }
}
