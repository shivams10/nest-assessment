import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { InterviewerCalendarService } from './interviewer-calendar.service';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService, InterviewerCalendarService],
  exports: [CalendarService, InterviewerCalendarService],
})
export class CalendarModule {}
