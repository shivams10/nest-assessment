import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GetUser } from '@modules/auth/decorators/get-user.decorator';
import { SubmissionService } from './submission.service';

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * Manually submit an exam (candidate action)
   */
  @Post(':submissionId/submit')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
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
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  getResult(@Param('id') submissionId: string, @GetUser('sub') userId: string) {
    return this.submissionService.getResult(submissionId, userId);
  }
}
