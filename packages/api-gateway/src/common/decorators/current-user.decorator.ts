import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (prop: string, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    const { user } = request;
    return prop ? user?.[prop] : user;
  },
);
