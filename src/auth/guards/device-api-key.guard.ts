import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class DeviceApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const key = (req.headers['x-api-key'] || req.headers['xapikey']) as
      | string
      | undefined;
    if (!key) throw new UnauthorizedException('Missing API key');
    if (key !== process.env.ESP_SECRET_KEY)
      throw new UnauthorizedException('Invalid API key');
    req.isDevice = true; // mark request origin
    return true;
  }
}
