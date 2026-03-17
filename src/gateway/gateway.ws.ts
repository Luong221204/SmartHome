import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth?.token; // Lấy token từ handshake

    try {
      const payload = this.jwtService.verify(token);
      context.switchToWs().getData().user = payload; // Lưu user vào data để dùng sau
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}