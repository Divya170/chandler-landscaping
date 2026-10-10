import {
  Body, Controller, Delete, Get, Header, HttpCode, Param, Patch, Post, Query, Res, UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { MAX_FILE_BYTES } from '../common/file-signature';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { InquiriesService, UploadedPhoto } from './inquiries.service';

@Controller()
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  /** Service options, labels and photo limits for the quote form. */
  @Get('form-options')
  options() {
    return this.inquiries.formOptions();
  }

  /**
   * POST /api/quote-requests — multipart/form-data (photos optional).
   * 201 {ok, reference} · 400 {errors} · 413 · 429 · 500
   */
  @Post('quote-requests')
  @HttpCode(201)
  @UseGuards(ThrottlerGuard)
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: MAX_FILE_BYTES, files: 10, fields: 30, fieldSize: 16 * 1024 } }))
  create(@Body() body: Record<string, unknown>, @UploadedFiles() files: UploadedPhoto[] = []) {
    return this.inquiries.create(body || {}, files || []);
  }

  /** Short-lived signed link to a photo (issued by the admin detail endpoint). */
  @Get('files/:id')
  async file(@Param('id') id: string, @Query('exp') exp: string, @Query('sig') sig: string, @Res() res: Response) {
    this.inquiries.assertUuid(id);
    const { file, full } = await this.inquiries.signedFile(id, exp, sig);
    res.setHeader('Content-Type', file.mime);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
    res.sendFile(full);
  }

  // ───── admin ─────
  @UseGuards(JwtAuthGuard)
  @Get('admin/leads')
  list(@Query() query: Record<string, string>) {
    return this.inquiries.list(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/leads/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="chandler-quote-requests.csv"')
  exportCsv(@Query() query: Record<string, string>) {
    return this.inquiries.exportCsv(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/leads/:id')
  detail(@Param('id') id: string) {
    this.inquiries.assertUuid(id);
    return this.inquiries.detail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/leads/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    this.inquiries.assertUuid(id);
    return this.inquiries.update(id, body || {});
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/leads/:id')
  remove(@Param('id') id: string) {
    this.inquiries.assertUuid(id);
    return this.inquiries.remove(id);
  }
}
