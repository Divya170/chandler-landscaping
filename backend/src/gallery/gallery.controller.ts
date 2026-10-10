import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { GalleryService } from './gallery.service';

@Controller()
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get('gallery')
  list(@Query('category') category?: string) {
    return this.gallery.publicList(category);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/gallery')
  adminList(@Query('q') q?: string, @Query('category') category?: string) {
    return this.gallery.adminList(q, category);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/gallery/categories')
  categories() {
    return this.gallery.categories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/gallery')
  create(@Body() body: Record<string, unknown>) {
    return this.gallery.create(body || {});
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/gallery/reorder')
  reorder(@Body() body: { ids?: unknown }) {
    return this.gallery.reorder(body?.ids);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/gallery/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.gallery.update(id, body || {});
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/gallery/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gallery.remove(id);
  }
}
