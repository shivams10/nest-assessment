import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@config/config.service';
import { CalendarService } from './calendar.service';
import { InterviewerCalendarService } from './interviewer-calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('calendar')
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(
    private readonly calendarService: CalendarService,
    private readonly interviewerCalendarService: InterviewerCalendarService,
    private readonly configService: ConfigService,
  ) {}

  // Returns the URL rather than redirecting directly: this endpoint is
  // guarded by JwtAuthGuard, which only reads the Authorization header —
  // never sent on a plain browser navigation (an <a href>, a raw curl).
  // The frontend fetches this via the authenticated axios instance, then
  // does the actual page navigation itself to Google's own consent screen.
  @Get('connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  connect(): { url: string } {
    return { url: this.calendarService.generateAuthUrl() };
  }

  // Hit directly by Google's redirect — no JWT is available here. Protected
  // instead by the one-time `state` value minted only for an already-admin
  // caller in connect() above.
  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl =
      this.configService.frontendUrl || 'http://localhost:5173';
    const redirectTo = (status: 'connected' | 'error') =>
      res.redirect(`${frontendUrl}/recruit/rooms?calendar=${status}`);

    if (error || !code || !this.calendarService.validateState(state)) {
      return redirectTo('error');
    }

    try {
      await this.calendarService.handleCallback(code);
      return redirectTo('connected');
    } catch (err) {
      this.logger.error(
        `Calendar callback failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return redirectTo('error');
    }
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'recruiter')
  async status(): Promise<{ connected: boolean }> {
    return { connected: await this.calendarService.isConnected() };
  }

  // ── Per-interviewer calendar connection (freebusy only) ──────────────────

  // See the comment on connect() above — same reason this returns JSON
  // instead of redirecting directly.
  @Get('interviewer/connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('interviewer')
  connectInterviewer(@GetUser('sub') interviewerId: string): { url: string } {
    return {
      url: this.interviewerCalendarService.generateAuthUrl(interviewerId),
    };
  }

  // Hit directly by Google's redirect — no JWT here. The `state` value both
  // proves an already-interviewer caller initiated this AND identifies which
  // interviewer's token this is (see InterviewerCalendarService.consumeState).
  @Get('interviewer/callback')
  async interviewerCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl =
      this.configService.frontendUrl || 'http://localhost:5173';
    const redirectTo = (status: 'connected' | 'error') =>
      res.redirect(`${frontendUrl}/interview/dashboard?calendar=${status}`);

    const interviewerId = this.interviewerCalendarService.consumeState(state);

    if (error || !code || !interviewerId) {
      return redirectTo('error');
    }

    try {
      await this.interviewerCalendarService.handleCallback(interviewerId, code);
      return redirectTo('connected');
    } catch (err) {
      this.logger.error(
        `Interviewer calendar callback failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return redirectTo('error');
    }
  }

  @Get('interviewer/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('interviewer')
  async interviewerStatus(
    @GetUser('sub') interviewerId: string,
  ): Promise<{ connected: boolean }> {
    return {
      connected:
        await this.interviewerCalendarService.isConnected(interviewerId),
    };
  }
}
