import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { google } from 'googleapis';
import { ConfigService } from '@config/config.service';
import { PrismaService } from '@prisma/prisma.service';

const CALENDAR_CREDENTIAL_ID = 'default';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes — plenty for an admin to complete consent

// Deriving the type from googleapis's own bundled OAuth2 class (rather than
// importing OAuth2Client from google-auth-library directly) avoids a
// structural type mismatch when a different transitive version of
// google-auth-library also ends up in node_modules.
type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

export type CreateCalendarEventInput = {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails: string[];
};

export type CalendarEventResult = {
  googleCalendarEventId: string;
  meetLink: string | null;
};

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  // In-memory CSRF state for the one-time admin connect flow. Single-instance
  // deployment assumption — acceptable for a low-frequency admin-only action.
  private readonly pendingStates = new Map<string, number>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private buildOAuth2Client(): OAuth2Client {
    return new google.auth.OAuth2(
      this.configService.googleClientId,
      this.configService.googleClientSecret,
      this.configService.googleCalendarCallbackUrl,
    );
  }

  generateAuthUrl(): string {
    const state = randomUUID();
    this.pendingStates.set(state, Date.now() + STATE_TTL_MS);

    return this.buildOAuth2Client().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [CALENDAR_SCOPE],
      state,
    });
  }

  validateState(state: string | undefined): boolean {
    if (!state) return false;
    const expiresAt = this.pendingStates.get(state);
    this.pendingStates.delete(state);
    return expiresAt !== undefined && expiresAt > Date.now();
  }

  async handleCallback(code: string): Promise<void> {
    const client = this.buildOAuth2Client();
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error(
        'Google did not return a refresh token. If re-connecting the same account, revoke prior access at myaccount.google.com/permissions first.',
      );
    }

    await this.prisma.calendarCredential.upsert({
      where: { id: CALENDAR_CREDENTIAL_ID },
      create: {
        id: CALENDAR_CREDENTIAL_ID,
        refreshToken: tokens.refresh_token,
      },
      update: { refreshToken: tokens.refresh_token },
    });
  }

  async isConnected(): Promise<boolean> {
    const credential = await this.prisma.calendarCredential.findUnique({
      where: { id: CALENDAR_CREDENTIAL_ID },
    });
    return credential !== null;
  }

  private async getAuthenticatedClient(): Promise<OAuth2Client> {
    const credential = await this.prisma.calendarCredential.findUnique({
      where: { id: CALENDAR_CREDENTIAL_ID },
    });

    if (!credential) {
      throw new Error('Google Calendar is not connected yet');
    }

    const client = this.buildOAuth2Client();
    client.setCredentials({ refresh_token: credential.refreshToken });
    return client;
  }

  async createEvent(
    input: CreateCalendarEventInput,
  ): Promise<CalendarEventResult> {
    const auth = await this.getAuthenticatedClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const { data } = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      // Google does not email attendees by default — sendUpdates defaults to
      // 'none' when omitted, which would create the event silently.
      sendUpdates: 'all',
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startTime.toISOString() },
        end: { dateTime: input.endTime.toISOString() },
        attendees: input.attendeeEmails.map((email) => ({ email })),
        conferenceData: {
          createRequest: { requestId: randomUUID() },
        },
      },
    });

    return {
      googleCalendarEventId: data.id ?? '',
      meetLink: data.hangoutLink ?? null,
    };
  }

  async deleteEvent(eventId: string): Promise<void> {
    const auth = await this.getAuthenticatedClient();
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  }
}
