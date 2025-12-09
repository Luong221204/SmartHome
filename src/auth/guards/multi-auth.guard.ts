import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { DeviceApiKeyGuard } from './device-api-key.guard';

@Injectable()
export class MultiAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // create new guards manually
    const jwtGuard = new JwtAuthGuard();
    const deviceGuard = new DeviceApiKeyGuard();

    // try JWT first
    try {
      const ok = await jwtGuard.canActivate(ctx as any);
      if (ok) {
        const req = ctx.switchToHttp().getRequest();
        req.isDevice = false;
        return true;
      }
    } catch (e) {}

    // try device apikey
    try {
      const ok = deviceGuard.canActivate(ctx);
      if (ok) return true;
    } catch (e) {}

    throw new UnauthorizedException('Unauthorized');
  }
}
