import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@prisma/prisma.service';
import { ConfigService } from '@config/config.service';
import { LoginDto } from './dto/login.dto';
import { LoginWithExamPasswordDto } from './dto/login-with-exam-password.dto';

export interface JwtPayload {
  sub: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: loginDto.email, mode: 'insensitive' },
        isActive: true,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive || user.deletedAt !== null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'No password set for this account. Use Google sign-in or ask an admin to set a password.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessTokenOptions: JwtSignOptions = {
      secret: this.configService.jwtAccessSecret,

      expiresIn: this.configService.jwtAccessExpiresIn,
    };

    const refreshTokenOptions: JwtSignOptions = {
      secret: this.configService.jwtRefreshSecret,

      expiresIn: this.configService.jwtRefreshExpiresIn,
    };

    const accessToken = await this.jwtService.signAsync(
      payload,
      accessTokenOptions,
    );

    const refreshToken = await this.jwtService.signAsync(
      payload,
      refreshTokenOptions,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Candidate/student login using exam master password.
   * Finds the candidate by email, finds an exam in their session whose master password matches,
   * then issues tokens and returns the exam id so the frontend can open that exam board.
   */
  async loginWithExamPassword(
    dto: LoginWithExamPasswordDto,
  ): Promise<AuthTokens & { examId: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: dto.email, mode: 'insensitive' },
        role: 'candidate',
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, collegeSessionId: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or exam password');
    }

    if (!user.collegeSessionId) {
      throw new UnauthorizedException(
        'You are not assigned to any exam session. Contact your administrator.',
      );
    }

    let exam: { id: string } | null = null;
    const examsWithHash = await this.prisma.exam.findMany({
      where: {
        collegeSessionId: user.collegeSessionId,
        isPublished: true,
        deletedAt: null,
      },
      select: { id: true, masterPasswordHash: true },
    });
    for (const e of examsWithHash) {
      const match = await bcrypt.compare(
        dto.masterPassword,
        e.masterPasswordHash,
      );
      if (match) {
        exam = { id: e.id };
        break;
      }
    }

    if (!exam) {
      throw new UnauthorizedException('Invalid email or exam password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: 'candidate',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.jwtAccessSecret,
      expiresIn: this.configService.jwtAccessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      examId: exam.id,
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   * Returns new access token; refresh token is rotated optionally (here we only return access token).
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken?.trim()) {
      throw new UnauthorizedException('Refresh token required');
    }
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: this.configService.jwtAccessSecret,
        expiresIn: this.configService.jwtAccessExpiresIn,
      },
    );
    return { accessToken };
  }

  /**
   * Generate tokens for a user (reused by Google OAuth login)
   */
  async generateTokens(user: {
    id: string;
    role: string;
  }): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessTokenOptions: JwtSignOptions = {
      secret: this.configService.jwtAccessSecret,
      expiresIn: this.configService.jwtAccessExpiresIn,
    };

    const refreshTokenOptions: JwtSignOptions = {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpiresIn,
    };

    const accessToken = await this.jwtService.signAsync(
      payload,
      accessTokenOptions,
    );

    const refreshToken = await this.jwtService.signAsync(
      payload,
      refreshTokenOptions,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isActive: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  /**
   * Login with Google OAuth user
   */
  async loginWithGoogle(user: {
    id: string;
    role: string;
    isActive: boolean;
    deletedAt: Date | null;
  }): Promise<AuthTokens> {
    // Validate user is active and not deleted
    if (!user.isActive || user.deletedAt !== null) {
      throw new UnauthorizedException('Account is inactive or deleted');
    }

    return this.generateTokens(user);
  }
}
