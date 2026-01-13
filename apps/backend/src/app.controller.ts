import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Req() req: Request, @Res() res: Response): void {
    // Handle OAuth callback if it comes to root (misconfigured callback URL)
    // This happens when GOOGLE_CALLBACK_URL is set to http://localhost:3000/
    // instead of http://localhost:3000/auth/google/callback
    const code = req.query?.code;
    const error = req.query?.error;

    if (code || error) {
      // Redirect to proper OAuth callback endpoint
      const queryString = new URLSearchParams(
        req.query as Record<string, string>,
      ).toString();
      return res.redirect(`/auth/google/callback?${queryString}`);
    }

    // Not an OAuth callback, return hello
    res.send(this.appService.getHello());
  }
}
