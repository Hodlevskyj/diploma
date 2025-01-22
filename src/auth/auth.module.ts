import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, PrismaService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
