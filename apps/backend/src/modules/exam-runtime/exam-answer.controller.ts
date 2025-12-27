import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ExamAnswerService } from './exam-answer.service';

@Controller('exam-runtime/answers')
@UseGuards(JwtAuthGuard)
export class ExamAnswerController {
  constructor(private readonly service: ExamAnswerService) {}

  @Post()
  submit(@Body() dto: SubmitAnswersDto, @GetUser('sub') userId: string) {
    return this.service.submitAnswers(dto, userId);
  }
}
