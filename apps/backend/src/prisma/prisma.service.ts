import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@config/config.service';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const pool = new Pool({
      connectionString: configService.databaseUrl,
      max: 20, // Maximum pool size
      min: 5, // Minimum pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    });

    super(
      // Prisma 7 adapter typings are intentionally loose.
      // This is the correct and minimal unsafe boundary.
      {
        adapter: new PrismaPg(pool),
      },
    );
  }
}
