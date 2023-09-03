import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { AuthService, ResetPasswordTransaction } from './auth.service';
import { Session } from './entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt-strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { Jwt2FAStrategy } from './strategies/jwt-2fa.strategy';
import { CipherModule } from '../common/modules/cipher/cipher.module';
import { RecoveryTokenModule } from '../recovery-token/recovery-token.module';

@Module({
  imports: [
    CipherModule,
    JwtModule.register({}),
    PassportModule,
    RecoveryTokenModule,
    TypeOrmModule.forFeature([Session]),
    UserModule,
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
