import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) throw new UnauthorizedException('Invalid token payload');
    const user = await this.authService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    // return the object that will be set to req.user
    return { id: user.id, email: user.email, role: user.role, permissions: user.permissions || [] };
  }
}
