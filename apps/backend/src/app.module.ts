import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExamsModule } from './modules/exams/exam.module';
import { ExamAttemptsModule } from './modules/exam-attempts/exam-attempts.module';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule,
    PrismaModule,
    ExamsModule,
    ExamAttemptsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
