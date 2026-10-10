import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ContentService } from './content.service';

@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  // ───── public ─────
  @Get('content')
  bundle() {
    return this.content.bundle();
  }

  @Get('content/:type')
  list(@Param('type') type: string) {
    return this.content.listPublished(type);
  }

  // ───── admin ─────
  @UseGuards(JwtAuthGuard)
  @Get('admin/content/schemas')
  schemas() {
    return this.content.schemas();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/content')
  adminList(@Query('type') type: string, @Query('q') q?: string) {
    return this.content.adminList(type, q);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/content')
  create(@Body() body: Record<string, unknown>) {
    return this.content.create(String(body?.type || ''), body || {});
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/content/reorder')
  reorder(@Body() body: { type?: string; ids?: unknown }) {
    return this.content.reorder(String(body?.type || ''), body?.ids);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/content/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.content.update(id, body || {});
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/content/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.content.remove(id);
  }
}
