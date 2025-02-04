// import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
// import { PrismaService } from 'src/prisma.service';
// import { UserModule } from 'src/user/user.module';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { GoogleStrategy } from './google.strategy';

// @Module({
//   imports: [UserModule, PassportModule],
//   providers: [AuthService, PrismaService, GoogleStrategy],
//   controllers: [AuthController],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
