import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { GalleryModule } from '../gallery/gallery.module';
import { Settings } from '../settings/settings.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [ContentModule, GalleryModule, TypeOrmModule.forFeature([Settings])],
  providers: [SeedService],
})
export class SeedModule {}
