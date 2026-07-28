import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { google } from 'googleapis';
import { ConfigService } from '@config/config.service';
import { PrismaService } from '@prisma/prisma.service';

// Least-privilege scope: only allows freebusy.query, never exposes event
// titles/attendees/descriptions — deliberately more privacy-preserving than
// calendar.readonly, and less to ask each interviewer to individually consent to.
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.freebusy';
const STATE_TTL_MS = 10 * 60 * 1000;

type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

type PendingState = { userId: string; expiresAt: number };

@Injectable()
export class InterviewerCalendarService {
  private readonly logger = new Logger(InterviewerCalendarService.name);
  // In-memory CSRF state for the per-interviewer connect flow — same
  // single-instance assumption as the bot-account flow in calendar.service.ts,
  // except the value also carries which interviewer initiated it, since the
  // callback (hit directly by Google, no JWT) needs to know whose token this is.
  private readonly pendingStates = new Map<string, PendingState>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private buildOAuth2Client(): OAuth2Client {
    return new google.auth.OAuth2(
      this.configService.googleClientId,
      this.configService.googleClientSecret,
      this.configService.googleInterviewerCalendarCallbackUrl,
    );
  }

  generateAuthUrl(interviewerId: string): string {
    const state = randomUUID();
    this.pendingStates.set(state, {
      userId: interviewerId,
      expiresAt: Date.now() + STATE_TTL_MS,
    });

    return this.buildOAuth2Client().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [CALENDAR_SCOPE],
      state,
    });
  }

  /** Returns the interviewer id the state was minted for, or null if invalid/expired. */
  consumeState(state: string | undefined): string | null {
    if (!state) return null;
    const pending = this.pendingStates.get(state);
    this.pendingStates.delete(state);
    if (!pending || pending.expiresAt <= Date.now()) return null;
    return pending.userId;
  }

  async handleCallback(interviewerId: string, code: string): Promise<void> {
    const client = this.buildOAuth2Client();
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error(
        'Google did not return a refresh token. If re-connecting, revoke prior access at myaccount.google.com/permissions first.',
      );
    }

    await this.prisma.interviewerCalendarCredential.upsert({
      where: { userId: interviewerId },
      create: { userId: interviewerId, refreshToken: tokens.refresh_token },
      update: { refreshToken: tokens.refresh_token },
    });
  }

  async isConnected(interviewerId: string): Promise<boolean> {
    const credential =
      await this.prisma.interviewerCalendarCredential.findUnique({
        where: { userId: interviewerId },
      });
    return credential !== null;
  }

  /**
   * Best-effort — returns `true` if a real conflict was found on the
   * interviewer's own calendar, `false` if free, or `null` if they haven't
   * connected their calendar (or the API call failed) so the caller should
   * fall back to the app-internal DB check instead of blocking on this.
   */
  async hasConflict(
    interviewerId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean | null> {
    const credential =
      await this.prisma.interviewerCalendarCredential.findUnique({
        where: { userId: interviewerId },
      });
    if (!credential) return null;

    try {
      const client = this.buildOAuth2Client();
      client.setCredentials({ refresh_token: credential.refreshToken });
      const calendar = google.calendar({ version: 'v3', auth: client });

      const { data } = await calendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busy = data.calendars?.primary?.busy ?? [];
      return busy.length > 0;
    } catch (error) {
      this.logger.warn(
        `FreeBusy check failed for interviewer ${interviewerId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
