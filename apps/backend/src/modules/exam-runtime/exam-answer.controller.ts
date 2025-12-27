import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ExamAnswerService } from './exam-answer.service';

@Controller('exam-runtime/answers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
export class ExamAnswerController {
  constructor(private readonly service: ExamAnswerService) {}

  @Post()
  submit(@Body() dto: SubmitAnswersDto, @GetUser('sub') userId: string) {
    return this.service.submitAnswers(dto, userId);
  }
}
