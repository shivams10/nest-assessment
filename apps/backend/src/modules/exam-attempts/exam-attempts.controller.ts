import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ExamAttemptsService } from './exam-attempts.service';
import { StartExamDto } from './dto/start-exam.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';

@Controller('exam-attempts')
@UseGuards(JwtAuthGuard)
export class ExamAttemptsController {
  constructor(private readonly service: ExamAttemptsService) {}

  @Post('start')
  startExam(@Body() dto: StartExamDto, @GetUser('sub') userId: string) {
    return this.service.startExam(dto, userId);
  }
}
