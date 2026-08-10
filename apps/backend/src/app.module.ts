import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExamsModule } from './modules/exams/exam.module';
import { ExamAttemptsModule } from './modules/exam-attempts/exam-attempts.module';
import { ExamRuntimeModule } from './modules/exam-runtime/exam-runtime.module';
import { AdminModule } from './modules/admin/admin.module';
import { RecruitmentSessionModule } from './modules/recruitment-sessions/recruitment-session.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { AiModule } from './modules/ai/ai.module';
import { UsersModule } from './modules/users/users.module';
import { InterviewCandidatesModule } from './modules/interview-candidates/interview-candidates.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule,
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 300, // 300 requests per 60 seconds
      },
    ]),
    ExamsModule,
    ExamAttemptsModule,
    ExamRuntimeModule,
    AuthModule,
    AdminModule,
    RecruitmentSessionModule,
    QuestionsModule,
    AiModule,
    UsersModule,
    InterviewCandidatesModule,
    CalendarModule,
    RoomsModule,
    SessionsModule,
    QuestionBankModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
