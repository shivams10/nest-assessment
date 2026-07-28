import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@config/config.service';
import { PrismaService } from '@prisma/prisma.service';

export interface GoogleProfile {
  emails: Array<{ value: string }>;
  name: {
    givenName: string;
    familyName: string;
  };
  id: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const clientID = configService.googleClientId;
    const clientSecret = configService.googleClientSecret;
    const callbackURL = configService.googleCallbackUrl;

    if (!clientID || !clientSecret || !callbackURL) {
      // Strategy won't work without config, but don't crash the app
      super({
        clientID: '',
        clientSecret: '',
        callbackURL: '',
        scope: ['profile', 'email'],
      });
      return;
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();

      if (!email) {
        return done(new Error('No email found in Google profile'), undefined);
      }

      // Pre-registration model: a User row must already exist (created via an
      // invite flow) before Google OAuth can be used to log in. Google only
      // proves identity, not authorization.
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return done(
          new Error('You are not registered on this portal'),
          undefined,
        );
      }

      if (user.deletedAt) {
        // User was soft-deleted, don't allow login
        return done(new Error('Account not found'), undefined);
      }

      if (!user.isActive) {
        return done(new Error('Your account has been deactivated'), undefined);
      }

      // Return user entity
      return done(undefined, user);
    } catch (error) {
      return done(
        error instanceof Error ? error : new Error('Authentication failed'),
        undefined,
      );
    }
  }
}
