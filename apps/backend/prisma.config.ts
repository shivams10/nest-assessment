// Prisma skips its own .env loading when a prisma.config.ts is present, so the
// datasource url in schema.prisma would resolve to undefined without this.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // datasource: {
  //   url: process.env.DATABASE_URL!,
  // },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});
