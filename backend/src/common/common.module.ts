import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from '../config';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [JwtModule.register({ global: true, secret: config.jwtSecret, signOptions: { expiresIn: '12h' } })],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class CommonModule {}
