import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { LeadFile } from './lead-file.entity';
import { Lead } from './lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, LeadFile]), ContentModule, MailModule, SettingsModule],
  controllers: [InquiriesController],
  providers: [InquiriesService],
})
export class InquiriesModule {}
