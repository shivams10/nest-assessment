import { Injectable } from '@nestjs/common';
import type { StringValue } from 'ms';

import { envSchema } from './env.schema';

@Injectable()
export class ConfigService {
  private readonly env: ReturnType<typeof envSchema.parse>;

  constructor() {
    this.env = envSchema.parse(process.env);
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get jwtAccessSecret(): string {
    return this.env.JWT_ACCESS_SECRET;
  }

  get jwtAccessExpiresIn(): StringValue {
    return this.env.JWT_ACCESS_EXPIRES_IN;
  }

  get jwtRefreshSecret(): string {
    return this.env.JWT_REFRESH_SECRET;
  }

  get jwtRefreshExpiresIn(): StringValue {
    return this.env.JWT_REFRESH_EXPIRES_IN;
  }

  get googleClientId(): string | undefined {
    return this.env.GOOGLE_CLIENT_ID;
  }

  get googleClientSecret(): string | undefined {
    return this.env.GOOGLE_CLIENT_SECRET;
  }

  get googleCallbackUrl(): string | undefined {
    return this.env.GOOGLE_CALLBACK_URL;
  }

  get frontendUrl(): string | undefined {
    return this.env.FRONTEND_URL;
  }
}
