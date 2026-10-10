import { Injectable, Logger, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { FieldErrors, str, throwIfErrors } from '../common/errors';
import { config } from '../config';
import { AdminUser } from './admin-user.entity';

@Injectable()
export class AdminAuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger('AdminAuth');

  constructor(
    @InjectRepository(AdminUser) private readonly users: Repository<AdminUser>,
    private readonly jwt: JwtService,
  ) {}

  /** Seeds one admin on first boot and prints the credentials. Idempotent. */
  async onApplicationBootstrap() {
    if (config.usingDevSecret) this.logger.warn('JWT_SECRET is not set — using an insecure development secret.');
    if ((await this.users.count()) > 0) return;
    await this.users.save(
      this.users.create({ email: config.adminEmail, name: 'Beau Chandler', passwordHash: await bcrypt.hash(config.adminPassword, 10) }),
    );
    this.logger.log('──────────────────────────────────────────────');
    this.logger.log('Default admin account created');
    this.logger.log(`  email:    ${config.adminEmail}`);
    this.logger.log(`  password: ${config.adminPassword}`);
    this.logger.log('  Sign in at /admin/login and change it under Account.');
    this.logger.log('──────────────────────────────────────────────');
  }

  async login(body: { email?: unknown; password?: unknown }) {
    const email = str(body.email).trim().toLowerCase();
    const password = str(body.password);
    const errors: FieldErrors = {};
    if (!email) errors.email = 'Please enter your email address.';
    if (!password) errors.password = 'Please enter your password.';
    throwIfErrors(errors);
    const user = await this.users.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException({ message: 'That email and password don’t match an admin account.' });
    }
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { token, admin: { id: user.id, email: user.email, name: user.name } };
  }

  async me(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException({ message: 'Please sign in again.' });
    return { id: user.id, email: user.email, name: user.name };
  }

  async changePassword(id: number, body: { currentPassword?: unknown; newPassword?: unknown }) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException({ message: 'Please sign in again.' });
    const current = str(body.currentPassword);
    const next = str(body.newPassword);
    const errors: FieldErrors = {};
    if (!(await bcrypt.compare(current, user.passwordHash))) errors.currentPassword = 'Your current password is incorrect.';
    if (next.length < 10) errors.newPassword = 'Use at least 10 characters.';
    throwIfErrors(errors);
    user.passwordHash = await bcrypt.hash(next, 10);
    await this.users.save(user);
    return { ok: true };
  }
}
