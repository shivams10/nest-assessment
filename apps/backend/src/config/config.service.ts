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
    return this.env.JWT_ACCESS_EXPIRES_IN as StringValue;
  }

  get jwtRefreshSecret(): string {
    return this.env.JWT_REFRESH_SECRET;
  }

  get jwtRefreshExpiresIn(): StringValue {
    return this.env.JWT_REFRESH_EXPIRES_IN as StringValue;
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

  get openaiApiKey(): string | undefined {
    return this.env.OPENAI_API_KEY;
  }

  get openaiModel(): string {
    return this.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  get openaiMaxTokens(): number {
    const maxTokens = this.env.OPENAI_MAX_TOKENS;
    if (maxTokens) {
      const parsed = parseInt(maxTokens, 10);
      return isNaN(parsed) ? 4000 : parsed;
    }
    return 4000;
  }
}
