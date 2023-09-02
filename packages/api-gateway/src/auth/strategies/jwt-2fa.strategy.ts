import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';
import { IJwtPayload } from '../token.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class Jwt2FAStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(
    readonly config: ConfigService,
    private readonly user: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.secret2FAToken'),
    });
  }

  async validate(payload: IJwtPayload): Promise<User> {
    // Get user from DB and add the result on req.user
    const user = await this.user.findById(payload.sub);
    if (user === null) throw new UnauthorizedException();
    await this.user.validateUserAuth(user);
    return user;
  }
}
