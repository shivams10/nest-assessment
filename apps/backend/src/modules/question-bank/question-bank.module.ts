import { Module } from '@nestjs/common';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankRepository } from './question-bank.repository';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionBankController],
  providers: [QuestionBankService, QuestionBankRepository],
})
export class QuestionBankModule {}
