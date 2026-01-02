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
    if (!payload.sub || !payload.email) return {message : 'Invalid token', status:false};
    console.log('JWT payload:', payload.sub, payload.email);
    const user = await this.authService.findById(payload.sub);
    if (!user) return {message : 'User not found', status:false};
    // return the object that will be set to req.user
    return { id: user.id, email: user.email, role: user.role, permissions: user.permissions || [] };
  }
}
