import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@config/config.service';

export interface JwtPayload {
  sub: string;
  role: 'admin' | 'moderator' | 'candidate' | 'recruiter' | 'interviewer';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtFromRequest: StrategyOptions['jwtFromRequest'] =
      ExtractJwt.fromAuthHeaderAsBearerToken();

    const options: StrategyOptions = {
      jwtFromRequest,
      secretOrKey: configService.jwtAccessSecret,
      ignoreExpiration: false,
    };

    super(options);
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
