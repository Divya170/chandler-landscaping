import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings')
  async publicSettings() {
    return this.settings.toPublic(await this.settings.get());
  }

  @Get('privacy-policy')
  privacyPolicy() {
    return this.settings.privacyPolicy();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/settings')
  adminSettings() {
    return this.settings.get();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/settings')
  update(@Body() body: Record<string, unknown>) {
    return this.settings.update(body || {});
  }
}
