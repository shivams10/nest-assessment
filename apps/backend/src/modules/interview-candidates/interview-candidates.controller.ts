import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { InterviewCandidatesService } from './interview-candidates.service';
import { CreateInterviewCandidateDto } from './dto/create-interview-candidate.dto';
import { ListInterviewCandidatesDto } from './dto/list-interview-candidates.dto';
import { RESUME_UPLOAD_OPTIONS } from './resume-upload.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

// NOTE: the old college-assessment CandidatesModule (src/modules/candidates)
// also has a natural claim on the "/candidates" prefix, but it is not
// registered in app.module.ts today. If it's ever reactivated, one of the
// two controllers will need a different prefix.
@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'recruiter')
export class InterviewCandidatesController {
  constructor(
    private readonly interviewCandidatesService: InterviewCandidatesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('resume', RESUME_UPLOAD_OPTIONS))
  createCandidate(
    @GetUser('sub') addedBy: string,
    @Body() dto: CreateInterviewCandidateDto,
    @UploadedFile() resume: Express.Multer.File | undefined,
  ) {
    return this.interviewCandidatesService.createCandidate(
      addedBy,
      dto,
      resume,
    );
  }

  @Get()
  listCandidates(@Query() dto: ListInterviewCandidatesDto) {
    return this.interviewCandidatesService.listCandidates(dto);
  }

  @Get(':id')
  getCandidateById(@Param('id') id: string) {
    return this.interviewCandidatesService.getCandidateById(id);
  }

  @Get(':id/resume')
  async downloadResume(@Param('id') id: string, @Res() res: Response) {
    const { path, candidateName } =
      await this.interviewCandidatesService.getResumeFile(id);
    return res.download(path, `${candidateName}-resume${extnameOf(path)}`);
  }
}

function extnameOf(path: string): string {
  const dotIndex = path.lastIndexOf('.');
  return dotIndex === -1 ? '' : path.slice(dotIndex);
}
