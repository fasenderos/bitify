import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';
import { IJwtPayload } from '../token.service';
import { UserService } from '../../user/user.service';
import { SessionService } from '../session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly config: ConfigService,
    private readonly session: SessionService,
    private readonly user: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.secretAccessToken'),
    });
  }

  async validate(payload: IJwtPayload): Promise<User> {
    // Check that the session exist. On logout the session is destroyed but the token may still be valid
    const session = await this.session.findById(payload.jti);
    if (session === null || session.expires.getTime() < Date.now())
      throw new UnauthorizedException();

    // Get user from DB and add the result on req.user
    const user = await this.user.findById(payload.sub);
    if (user === null) throw new UnauthorizedException();
    this.user.validateUserAuth(user);
    return user;
  }
}
