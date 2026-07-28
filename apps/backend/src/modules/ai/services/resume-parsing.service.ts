import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@config/config.service';
import { ParsedResume } from '../dto/parsed-resume.dto';
import { AiResponseParseError, ValidationError } from '../errors/ai-errors';

const MAX_RESUME_CHARS = 12000; // ~ a few thousand tokens, resumes are short
const OPENAI_TIMEOUT_MS = 20_000; // must stay well under a synchronous HTTP request

const SYSTEM_PROMPT =
  'You are a resume parser. Extract structured data from the resume text ' +
  'the user provides. Return ONLY valid JSON, no markdown, no explanations, ' +
  'matching exactly this shape: ' +
  '{"phone": string|null, "skills": string[], "yearsOfExperience": number|null, ' +
  '"education": [{"degree": string, "institution": string, "year": number|null}]}. ' +
  'If a field cannot be determined, use null (or an empty array for skills/education).';

@Injectable()
export class ResumeParsingService {
  private readonly logger = new Logger(ResumeParsingService.name);
  private readonly openai: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.openaiApiKey;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Best-effort parse — throws on any failure so the caller can decide to
   * proceed without parsed fields rather than fail the whole request.
   */
  async parseResumeText(text: string): Promise<ParsedResume> {
    if (!this.openai) {
      throw new Error(
        'OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.',
      );
    }

    const trimmedText = text.slice(0, MAX_RESUME_CHARS);

    let response: OpenAI.Chat.Completions.ChatCompletion;
    try {
      response = await this.openai.chat.completions.create(
        {
          model: this.configService.openaiModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: trimmedText },
          ],
          temperature: 0.2,
          max_tokens: 1000,
        },
        { maxRetries: 0, timeout: OPENAI_TIMEOUT_MS },
      );
    } catch (error) {
      throw new AiResponseParseError(
        `OpenAI API call failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AiResponseParseError('OpenAI response contains no content');
    }

    let parsed: unknown;
    try {
      const cleanedContent = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleanedContent);
    } catch (error) {
      throw new AiResponseParseError(
        `Failed to parse AI response as JSON: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    return this.validateParsedResume(parsed);
  }

  private validateParsedResume(value: unknown): ParsedResume {
    if (typeof value !== 'object' || value === null) {
      throw new ValidationError('Parsed resume is not an object');
    }

    const candidate = value as Record<string, unknown>;

    const skills = Array.isArray(candidate.skills)
      ? candidate.skills.filter((s): s is string => typeof s === 'string')
      : [];

    const education = Array.isArray(candidate.education)
      ? candidate.education
          .filter(
            (e): e is Record<string, unknown> =>
              typeof e === 'object' && e !== null,
          )
          .map((e) => ({
            degree: typeof e.degree === 'string' ? e.degree : '',
            institution: typeof e.institution === 'string' ? e.institution : '',
            year: typeof e.year === 'number' ? e.year : null,
          }))
      : [];

    const yearsOfExperience =
      typeof candidate.yearsOfExperience === 'number'
        ? candidate.yearsOfExperience
        : null;

    const phone = typeof candidate.phone === 'string' ? candidate.phone : null;

    return { phone, skills, yearsOfExperience, education };
  }
}
