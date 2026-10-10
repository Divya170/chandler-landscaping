import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true });
  // The Next.js server proxies /api and /media; trust its X-Forwarded-For so rate limits apply per visitor.
  app.set('trust proxy', 'loopback');
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: '256kb' });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: config.frontendOrigins, credentials: false });

  fs.mkdirSync(config.publicMediaDir, { recursive: true });
  app.useStaticAssets(config.publicMediaDir, { prefix: '/media/', maxAge: '30d', index: false, dotfiles: 'deny' });

  await app.listen(config.port);
  new Logger('Bootstrap').log(`API ready on http://localhost:${config.port}/api  (database: ${config.databasePath})`);
}
bootstrap();
