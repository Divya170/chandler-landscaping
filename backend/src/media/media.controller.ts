import { BadRequestException, Controller, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { throwIfErrors } from '../common/errors';
import { MAX_FILE_BYTES, verifyFile } from '../common/file-signature';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { config } from '../config';

/**
 * Admin uploads for public CMS content, served from /media/*.
 * kind=image → JPG/PNG/WebP (projects, services, hero, team). kind=document → PDF (safety documents).
 */
@Controller('admin/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor() {
    fs.mkdirSync(config.publicMediaDir, { recursive: true });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_BYTES, files: 1 } }))
  upload(@Query('kind') kind: string, @UploadedFile() file?: { buffer: Buffer; size: number; originalname: string }) {
    if (!file) throw new BadRequestException({ errors: { file: 'Choose a file to upload.' }, message: 'Choose a file.' });
    const isDoc = kind === 'document';
    const allowed = isDoc ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'];
    const verified = verifyFile(file.originalname, file.buffer, allowed);
    if (!verified) throwIfErrors({ file: isDoc ? 'Upload a PDF file.' : 'Upload a JPG, PNG or WebP image.' });
    const name = `${randomUUID()}.${verified!.ext}`;
    fs.writeFileSync(path.join(config.publicMediaDir, name), file.buffer);
    return { url: `/media/${name}`, bytes: file.size, mime: verified!.mime, name: file.originalname };
  }
}
