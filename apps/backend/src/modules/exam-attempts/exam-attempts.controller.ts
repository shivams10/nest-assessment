import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ExamAttemptsService } from './exam-attempts.service';
import { StartExamDto } from './dto/start-exam.dto';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';

@Controller('exam-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
export class ExamAttemptsController {
  constructor(private readonly service: ExamAttemptsService) {}

  @Post('start')
  startExam(@Body() dto: StartExamDto, @GetUser('sub') userId: string) {
    return this.service.startExam(dto, userId);
  }
}
