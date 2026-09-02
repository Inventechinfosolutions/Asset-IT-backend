import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUserPayload = {
  id: string;
  aliasName: string;
  role: string;
  name: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
