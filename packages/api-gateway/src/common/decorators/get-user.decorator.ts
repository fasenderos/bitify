import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

export const GetUser = createParamDecorator(
  (prop: string, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    const { user } = request;
    return prop ? user?.[prop] : user;
  },
);
