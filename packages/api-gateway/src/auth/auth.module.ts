import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfig } from '../../typings/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt-strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<AppConfig['auth']['secretAccessToken']>(
          'auth.secretAccessToken',
        ) as string,
        signOptions: {
          expiresIn: configService.get<AppConfig['auth']['expAccessToken']>(
            'auth.expAccessToken',
          ),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Session]),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy, SessionService, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
