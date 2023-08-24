import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { IJwtPayload } from '../token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly user: UserService,
    readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.secretAccessToken'),
    });
  }

  async validate(payload: IJwtPayload): Promise<User> {
    const user = await this.user.findById(payload.sub);
    if (user == null) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
