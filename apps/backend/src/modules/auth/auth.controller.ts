import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService, AuthTokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@config/config.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(@Req() req: Request, @Res() res: Response): void {
    // Check if Google OAuth is configured
    if (
      !this.configService.googleClientId ||
      !this.configService.googleClientSecret ||
      !this.configService.googleCallbackUrl
    ) {
      const frontendUrl =
        this.configService.frontendUrl || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent('Google OAuth is not configured')}`,
      );
      return;
    }
    // Guard will handle redirect to Google
    // Passport automatically redirects, so we don't need to do anything here
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req()
    req: Request & {
      user?: {
        id: string;
        role: string;
        isActive: boolean;
        deletedAt: Date | null;
      };
      query?: { code?: string; error?: string };
    },
    @Res() res: Response,
  ): Promise<void> {
    // Check for OAuth errors from Google
    if (req.query?.error) {
      const frontendUrl =
        this.configService.frontendUrl || 'http://localhost:5173';
      let errorMessage = '';

      if (req.query.error === 'access_denied') {
        errorMessage = 'Google sign-in was cancelled';
      } else if (req.query.error === 'redirect_uri_mismatch') {
        const callbackUrl = this.configService.googleCallbackUrl || 'NOT SET';
        errorMessage = `Redirect URI mismatch. Configured callback: ${callbackUrl}. Please ensure this EXACT URL is added to Google Cloud Console Authorized redirect URIs.`;
      } else {
        errorMessage = `OAuth error: ${req.query.error}`;
      }

      return res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`,
      );
    }

    const user = req.user;

    if (!user) {
      const frontendUrl =
        this.configService.frontendUrl || 'http://localhost:5173';
      return res.redirect(
        `${frontendUrl}/auth/callback?error=authentication_failed`,
      );
    }

    try {
      const tokens = await this.authService.loginWithGoogle(user);
      const frontendUrl =
        this.configService.frontendUrl || 'http://localhost:5173';

      // Set refresh token as httpOnly cookie (same as regular login flow)
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      return res.redirect(
        `${frontendUrl}/auth/callback?token=${tokens.accessToken}`,
      );
    } catch (error) {
      const frontendUrl =
        this.configService.frontendUrl || 'http://localhost:5173';
      return res.redirect(
        `${frontendUrl}/auth/callback?error=${error instanceof Error ? encodeURIComponent(error.message) : 'authentication_failed'}`,
      );
    }
  }
}
