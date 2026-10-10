import { Body, Controller, Get, HttpCode, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminJwtPayload, JwtAuthGuard } from '../common/jwt-auth.guard';
import { AdminAuthService } from './admin-auth.service';

type AuthedRequest = { admin: AdminJwtPayload };

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 10 * 60 * 1000 } })
  login(@Body() body: Record<string, unknown>) {
    return this.auth.login(body || {});
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.admin.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  changePassword(@Req() req: AuthedRequest, @Body() body: Record<string, unknown>) {
    return this.auth.changePassword(req.admin.sub, body || {});
  }
}
