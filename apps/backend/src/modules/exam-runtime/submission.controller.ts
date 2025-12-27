import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';
import { SubmissionService } from './submission.service';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * Manually submit an exam (candidate action)
   */
  @Post(':submissionId/submit')
  submitExam(
    @Param('submissionId') submissionId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.submissionService.submitManually(submissionId, userId);
  }

  /**
   * Get exam result for a candidate
   */
  @Get(':id/result')
  getResult(@Param('id') submissionId: string, @GetUser('sub') userId: string) {
    return this.submissionService.getResult(submissionId, userId);
  }
}
