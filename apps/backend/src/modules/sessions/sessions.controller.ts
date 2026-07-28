import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'recruiter', 'interviewer')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles('admin', 'recruiter')
  createSession(
    @GetUser('sub') callerId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.createSession(callerId, dto);
  }

  @Get()
  listSessions(
    @GetUser('sub') callerId: string,
    @GetUser('role') callerRole: JwtPayload['role'],
  ) {
    return this.sessionsService.listSessions(callerId, callerRole);
  }

  @Get('availability')
  @Roles('admin', 'recruiter')
  checkAvailability(@Query() dto: CheckAvailabilityDto) {
    return this.sessionsService.checkAvailability(dto);
  }
}
