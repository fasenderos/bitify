import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { AuthService, ResetPasswordTransaction } from './auth.service';
import { Session } from './entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt-strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { Jwt2FAStrategy } from './strategies/jwt-2fa.strategy';
import { CipherModule } from '../common/modules/cipher/cipher.module';
import { RecoveryTokensModule } from '../recovery-tokens/recovery-tokens.module';

@Module({
  imports: [
    CipherModule,
    JwtModule.register({}),
    PassportModule,
    RecoveryTokensModule,
    TypeOrmModule.forFeature([Session]),
    UsersModule,
  ],
  providers: [
    AuthService,
    Jwt2FAStrategy,
    JwtRefreshStrategy,
    JwtStrategy,
    ResetPasswordTransaction,
    SessionService,
    TokenService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
