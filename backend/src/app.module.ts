import { Controller, Get, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { CommonModule } from './common/common.module';
import { config } from './config';
import { ContentModule } from './content/content.module';
import { dataSourceOptions } from './database/data-source';
import { SeedModule } from './database/seed.module';
import { GalleryModule } from './gallery/gallery.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { MediaModule } from './media/media.module';
import { SettingsModule } from './settings/settings.module';

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

@Controller('health')
class HealthController {
  @Get()
  health() {
    return { ok: true, time: new Date().toISOString() };
  }
}

@Module({
  imports: [
    // Schema changes ship as migrations (src/migrations) and run automatically on start-up; never `synchronize`.
    TypeOrmModule.forRoot({ ...dataSourceOptions(), migrationsRun: true }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: config.rateLimitWindowMs, limit: config.rateLimitMax }]),
    CommonModule,
    AdminAuthModule,
    SettingsModule,
    ContentModule,
    GalleryModule,
    InquiriesModule,
    MediaModule,
    SeedModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
