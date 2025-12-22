import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../auth.service';

export const GetUser = createParamDecorator(
  (key: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();

    if (!request.user) {
      return undefined;
    }

    return key ? request.user[key] : request.user;
  },
);
