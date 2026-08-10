import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './../src/modules/auth/guards/roles.guard';

// Requires a real database migrated with `npx prisma migrate dev` — will fail
// to boot without one, same as any other e2e spec that touches Prisma.
//
// Guards are overridden to inject a fake authenticated interviewer rather
// than exercising the real login flow, which is out of scope here. The user
// row is still real (not mocked) because QuestionBankItem.createdBy has a
// hard FK into User — Prisma/Postgres will reject the insert otherwise.
describe('QuestionBankController (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();
  let interviewerId: string;

  beforeAll(async () => {
    const interviewer = await prisma.user.create({
      data: {
        email: `e2e-question-bank-${Date.now()}@test.local`,
        role: 'interviewer',
      },
    });
    interviewerId = interviewer.id;
  });

  afterAll(async () => {
    await prisma.questionBankItem.deleteMany({
      where: { createdBy: interviewerId },
    });
    await prisma.user.delete({ where: { id: interviewerId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<{ user?: { sub: string; role: string } }>();
          req.user = { sub: interviewerId, role: 'interviewer' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a coding question with test cases', async () => {
    const res = await request(app.getHttpServer())
      .post('/question-bank')
      .send({
        tags: ['backend'],
        type: 'coding',
        prompt: 'Reverse a linked list',
        testCases: [
          { input: '[1,2,3]', expectedOutput: '[3,2,1]' },
          { input: '[]', expectedOutput: '[]', isHidden: true },
        ],
      })
      .expect(201);

    const body = res.body as { id: string; testCases: unknown[] };
    expect(body.id).toBeDefined();
    expect(body.testCases).toHaveLength(2);
  });

  it('rejects an mcq_single question with no options', () => {
    return request(app.getHttpServer())
      .post('/question-bank')
      .send({
        tags: ['backend'],
        type: 'mcq_single',
        prompt: 'What is a closure?',
      })
      .expect(400);
  });
});
