import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

/**
 * Normalises every error to the API contract:
 *  400 {errors:{field:message}} · 401/403/404 {message} · 413 {message} · 422 {message} · 429 {message} · 500 {message}
 * Internal error details are logged, never returned.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ThrottlerException) {
      return res.status(429).json({ message: 'Too many requests. Please wait a few minutes and try again.' });
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        if (b.errors) return res.status(status).json({ errors: b.errors, message: b.message ?? 'Please check the highlighted fields.' });
        if (status === HttpStatus.PAYLOAD_TOO_LARGE) return res.status(status).json({ message: 'One of your images is larger than 10 MB.' });
        const msg = Array.isArray(b.message) ? b.message.join(' ') : (b.message as string) || exception.message;
        return res.status(status).json({ message: msg });
      }
      return res.status(status).json({ message: String(body) });
    }
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
  }
}
