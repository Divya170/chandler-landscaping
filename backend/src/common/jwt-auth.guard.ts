import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AdminJwtPayload {
  sub: number;
  email: string;
}

/** Protects every /api/admin/* route. Expects `Authorization: Bearer <token>`. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { admin?: AdminJwtPayload }>();
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException({ message: 'Please sign in to continue.' });
    try {
      req.admin = await this.jwt.verifyAsync<AdminJwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException({ message: 'Your session has expired. Please sign in again.' });
    }
  }
}
