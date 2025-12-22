import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Param, Patch } from '@nestjs/common';

import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  createCandidate(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.createCandidate(dto);
  }

  @Get()
  listCandidates(@Query() dto: ListCandidatesDto) {
    return this.candidatesService.listCandidates(dto);
  }

  @Patch(':id/activate')
  activateCandidate(@Param('id') id: string) {
    return this.candidatesService.activateCandidate(id);
  }

  @Patch(':id/deactivate')
  deactivateCandidate(@Param('id') id: string) {
    return this.candidatesService.deactivateCandidate(id);
  }
}
