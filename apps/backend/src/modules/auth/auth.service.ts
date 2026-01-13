import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@prisma/prisma.service';
import { ConfigService } from '@config/config.service';
import { LoginDto } from './dto/login.dto';

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
        email: loginDto.email,
        role: { in: ['admin', 'moderator'] },
        isActive: true,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== 'admin' && user.role !== 'moderator') {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deletedAt !== null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
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
   * Generate tokens for a user (reused by Google OAuth login)
   */
  async generateTokens(user: { id: string; role: string }): Promise<AuthTokens> {
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
   * Login with Google OAuth user
   */
  async loginWithGoogle(user: { id: string; role: string; isActive: boolean; deletedAt: Date | null }): Promise<AuthTokens> {
    // Validate user is active and not deleted
    if (!user.isActive || user.deletedAt !== null) {
      throw new UnauthorizedException('Account is inactive or deleted');
    }

    return this.generateTokens(user);
  }
}
