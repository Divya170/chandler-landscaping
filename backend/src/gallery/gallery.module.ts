import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Project } from './project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), ContentModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
