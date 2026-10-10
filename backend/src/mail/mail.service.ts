import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { config } from '../config';

export interface OutgoingMail { to: string; subject: string; text: string; html: string; replyTo?: string }

/** Thin wrapper over nodemailer. Never throws: a mail problem must not break a quote submission. */
@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private transport: Transporter | null = null;
  private warned = false;

  get configured(): boolean {
    return !!(config.smtp.host && config.smtp.from);
  }

  private getTransport(): Transporter {
    if (!this.transport) {
      const { host, port, secure, user, pass } = config.smtp;
      this.transport = createTransport({
        host, port, secure,
        auth: user ? { user, pass } : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      });
    }
    return this.transport;
  }

  /** Resolves true when the message was handed to the SMTP server; false when alerts are off or sending failed. */
  async send(mail: OutgoingMail): Promise<boolean> {
    if (!this.configured) {
      if (!this.warned) {
        this.warned = true;
        this.logger.warn('Email alerts are off: set SMTP_HOST and SMTP_FROM in backend/.env to enable them.');
      }
      return false;
    }
    try {
      await this.getTransport().sendMail({ from: config.smtp.from, ...mail });
      return true;
    } catch (err) {
      this.logger.error(`Could not send email "${mail.subject}": ${(err as Error).message}`);
      return false;
    }
  }
}
