import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService, AuthTokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginWithExamPasswordDto } from './dto/login-with-exam-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './strategies/jwt.strategy';
import { ConfigService } from '@config/config.service';

function getRefreshTokenFromCookie(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [name, ...valueParts] = part.split('=');
    if (name?.trim() === 'refreshToken') {
      return valueParts.join('=').trim() || null;
    }
  }
  return null;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    const tokens = await this.authService.login(loginDto);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return tokens;
  }

  @Post('login-with-exam-password')
  async loginWithExamPassword(
    @Body() dto: LoginWithExamPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens & { examId: string }> {
    const result = await this.authService.loginWithExamPassword(dto);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string } | { accessBody: string }> {
    // New split-token flow: refresh token combined from localStorage body + cookie sig
    // is sent as Authorization: Bearer <combined>
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const refreshToken = authHeader.slice(7);
      const { accessToken } = await this.authService.refreshTokens(refreshToken);

      const parts     = accessToken.split('.');
      const accessBody = `${parts[0]}.${parts[1]}`;
      const accessSig  = parts[2] ?? '';

      res.cookie('ip_access_sig', accessSig, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 60 * 1000,
      });

      return { accessBody };
    }

    // Legacy flow (assessment platform): full refresh token in httpOnly cookie
    const refreshToken = getRefreshTokenFromCookie(req.headers.cookie);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() req: Request & { user?: JwtPayload },
  ): Promise<{ id: string; email: string; firstName: string | null; lastName: string | null; role: string }> {
    if (!req.user) throw new UnauthorizedException();
    return this.authService.getProfile(req.user.sub);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(@Res() res: Response): void {
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

      // Split access token: body (header.payload) goes to FE localStorage,
      // signature goes in a server-set cookie so neither half alone is a valid JWT.
      const accessParts = tokens.accessToken.split('.');
      const refreshParts = tokens.refreshToken.split('.');
      const accessBody  = `${accessParts[0]}.${accessParts[1]}`;
      const accessSig   = accessParts[2] ?? '';
      const refreshBody = `${refreshParts[0]}.${refreshParts[1]}`;
      const refreshSig  = refreshParts[2] ?? '';

      const cookieBase = {
        httpOnly: false, // FE must read these to recombine the token
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
      };

      res.cookie('ip_access_sig', accessSig, {
        ...cookieBase,
        maxAge: 30 * 60 * 1000, // 30 min — mirrors access token expiry
      });

      res.cookie('ip_refresh_sig', refreshSig, {
        ...cookieBase,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — mirrors refresh token expiry
      });

      return res.redirect(
        `${frontendUrl}/auth/callback` +
        `?access=${encodeURIComponent(accessBody)}` +
        `&refresh=${encodeURIComponent(refreshBody)}` +
        `&role=${encodeURIComponent(user.role ?? '')}`,
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
