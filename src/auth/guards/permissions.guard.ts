import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('No user');
    const userPerms = user.permissions || [];
    return required.every(p => userPerms.includes(p));
  }
}
