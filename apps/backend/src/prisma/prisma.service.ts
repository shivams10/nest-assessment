import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@config/config.service';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const pool = new Pool({
      connectionString: configService.databaseUrl,
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
