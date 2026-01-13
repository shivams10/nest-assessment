# Backend API Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Technology Stack](#technology-stack)
4. [Setup & Installation](#setup--installation)
5. [Project Structure](#project-structure)
6. [Key Modules](#key-modules)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [Development Guidelines](#development-guidelines)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a **NestJS 11** backend application for an online assessment/examination system. The system supports:

- **Multi-role access**: Admin, Moderator, and Candidate roles
- **Exam management**: Create, publish, and manage exams with multiple question sets
- **Candidate management**: Bulk upload candidates via CSV
- **Exam execution**: Real-time exam taking with answer submission
- **Auto-submission**: Automatic submission when exam time expires
- **Scoring & Ranking**: Automated scoring with ranking per exam
- **Result management**: View results with filtering and pagination

### Key Features

- ✅ JWT-based authentication with access/refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting for API protection
- ✅ Structured logging for observability
- ✅ Batch processing for large datasets
- ✅ Database connection pooling
- ✅ Production-ready error handling
- ✅ Type-safe Prisma ORM integration

---

## Architecture & Design Patterns

### Layered Architecture

The application follows a strict **Controller → Service → Repository** pattern:

```
Controller (HTTP layer)
    ↓
Service (Business logic)
    ↓
Repository (Data access)
    ↓
Prisma (Database)
```

### Key Principles

1. **No Direct Prisma Access from Controllers**: Controllers must use services
2. **No Cross-Domain Repository Calls**: Services call other services, not repositories
3. **Repository Pattern**: All database operations go through repositories
4. **DTO Validation**: All inputs validated using class-validator
5. **Type Safety**: Strict TypeScript with explicit return types
6. **Idempotency**: Critical operations (scoring, auto-submit) are safe to re-run

### Module Organization

Each feature is organized as a module with:
- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `*.repository.ts` - Database operations (if needed)
- `dto/` - Data Transfer Objects for validation

---

## Technology Stack

### Core Framework
- **NestJS 11** - Progressive Node.js framework
- **TypeScript 5.7** - Type-safe JavaScript
- **Express** - HTTP server (via NestJS platform)

### Database
- **PostgreSQL** - Relational database
- **Prisma 7** - Type-safe ORM
- **pg** - PostgreSQL driver with connection pooling

### Authentication
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for stateless auth
- **bcrypt** - Password hashing

### Validation & Transformation
- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **zod** - Environment variable validation

### Security & Performance
- **@nestjs/throttler** - API rate limiting
- **Connection pooling** - Optimized database connections

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

---

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- pnpm (package manager)
- PostgreSQL 14+
- Git

### Environment Variables

Create a `.env` file in the `apps/backend` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# JWT Configuration
JWT_ACCESS_SECRET="your-access-secret-key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# Frontend URL (for OAuth redirects)
FRONTEND_URL="http://localhost:5173"

# Optional: Google OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

### Installation Steps

1. **Install dependencies:**
   ```bash
   cd apps/backend
   pnpm install
   ```

2. **Set up database:**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run migrations
   pnpm prisma migrate dev
   
   # (Optional) Seed database
   pnpm prisma db seed
   ```

3. **Start development server:**
   ```bash
   pnpm run start:dev
   ```

   The server will start on `http://localhost:3000` (or PORT from env)

### Available Scripts

```bash
# Development
pnpm run start:dev      # Start with hot-reload
pnpm run start:debug    # Start with debugging

# Production
pnpm run build          # Build for production
pnpm run start:prod     # Start production server

# Code Quality
pnpm run lint           # Run ESLint
pnpm run format         # Format with Prettier

# Testing
pnpm run test           # Unit tests
pnpm run test:watch     # Watch mode
pnpm run test:cov       # Coverage report
pnpm run test:e2e       # End-to-end tests
```

---

## Project Structure

```
apps/backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── config/                 # Configuration modules
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── env.schema.ts
│   ├── prisma/                 # Prisma module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── modules/                # Feature modules
│       ├── auth/               # Authentication
│       ├── admin/               # Admin operations
│       ├── candidates/          # Candidate management
│       ├── exams/               # Exam management
│       ├── exam-attempts/       # Starting exams
│       ├── exam-runtime/        # Exam execution
│       └── scoring/             # Scoring & ranking
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── test/                        # E2E tests
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

---

## Key Modules

### 1. Auth Module (`modules/auth/`)

**Purpose**: Authentication and authorization

**Components**:
- `auth.controller.ts` - Login endpoint
- `auth.service.ts` - JWT token generation
- `guards/jwt-auth.guard.ts` - JWT validation guard
- `guards/roles.guard.ts` - Role-based access control
- `strategies/jwt.strategy.ts` - Passport JWT strategy
- `decorators/` - Custom decorators (`@GetUser()`, `@Roles()`)

**Key Features**:
- JWT access and refresh tokens
- Role-based access control (admin, moderator, candidate)
- Password hashing with bcrypt

### 2. Admin Module (`modules/admin/`)

**Purpose**: Administrative operations

**Endpoints**:
- `POST /admin/admins` - Create admin user
- `POST /admin/moderators` - Create moderator
- `PATCH /admin/users/:id/active` - Activate/deactivate user
- `PATCH /admin/users/:id/delete` - Soft delete user
- `GET /admin/users` - List users with pagination
- `GET /admin/results` - List exam results with filters

**Access**: Admin and Moderator roles only

### 3. Candidates Module (`modules/candidates/`)

**Purpose**: Candidate management

**Endpoints**:
- `POST /candidates` - Create single candidate
- `GET /candidates` - List candidates
- `POST /candidates/bulk-upload` - Bulk upload via CSV

**Features**:
- CSV parsing and validation
- Batch processing for large uploads
- Error reporting via CSV

### 4. Exams Module (`modules/exams/`)

**Purpose**: Exam creation and management

**Endpoints**:
- `POST /exams` - Create exam
- `GET /exams` - List exams (published for candidates, all for admin)
- `PATCH /exams/:id/publish` - Publish exam
- `PATCH /exams/:id/unpublish` - Unpublish exam
- `POST /exams/:id/sets` - Create exam set
- `POST /exams/:id/sets/:setId/sections` - Create section
- `POST /exams/:id/sets/:setId/questions` - Add questions to set

**Features**:
- Exam sets for randomization
- Section-based organization (aptitude/technical)
- Master password protection

### 5. Exam Attempts Module (`modules/exam-attempts/`)

**Purpose**: Starting exam attempts

**Endpoints**:
- `POST /exam-attempts/start` - Start exam (creates submission)

**Features**:
- Prevents multiple attempts (idempotent)
- Random exam set selection
- Submission creation with timestamp

### 6. Exam Runtime Module (`modules/exam-runtime/`)

**Purpose**: Exam execution and answer submission

**Endpoints**:
- `GET /exam-runtime?submissionId=xxx` - Get exam questions
- `POST /exam-runtime/answers` - Submit answers
- `POST /submissions/:id/submit` - Manually submit exam
- `GET /submissions/:id/result` - Get exam result

**Services**:
- `exam-runtime.service.ts` - Exam question retrieval
- `exam-answer.service.ts` - Answer submission (batch processing)
- `submission.service.ts` - Manual/auto submission
- `submission-time.service.ts` - Time validation
- `auto-submit.service.ts` - Expired submission processing

**Features**:
- Real-time answer submission
- Time-based validation
- Auto-submission on expiry
- Rate limiting (20 req/min for answers, 5 req/min for submit)

### 7. Scoring Module (`modules/scoring/`)

**Purpose**: Automated scoring and ranking

**Key Methods**:
- `scoreSubmission()` - Calculate marks for a submission
- `calculateRanksForExam()` - Calculate ranks for all candidates in an exam
- `getFinalResultForSubmission()` - Get result for a candidate
- `listResults()` - List results for admin (with filters)

**Features**:
- Idempotent scoring (safe to re-run)
- Batch processing for large exams (1000 results per batch)
- Ranking algorithm:
  1. Primary: `totalMarks` (descending)
  2. Tie-breaker 1: `technicalMarks` (descending)
  3. Tie-breaker 2: `submittedAt` (ascending - earlier is better)
- Memory-efficient for large datasets

---

## API Endpoints

### Authentication

#### `POST /auth/login`
Login and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` header and admin/moderator role.

#### `POST /admin/admins`
Create a new admin user.

#### `POST /admin/moderators`
Create a new moderator user.

#### `GET /admin/users?page=1&limit=10&role=candidate`
List users with pagination and optional role filter.

#### `GET /admin/results?examId=xxx&collegeSessionId=xxx&selectedForNextRound=true&page=1&limit=10`
List exam results with filters and pagination.

### Candidate Endpoints

All candidate endpoints require `Authorization: Bearer <token>` header and candidate role.

#### `POST /exam-attempts/start`
Start an exam attempt.

**Request:**
```json
{
  "examId": "uuid"
}
```

#### `GET /exam-runtime?submissionId=xxx`
Get exam questions for a submission.

#### `POST /exam-runtime/answers`
Submit answers (rate limited: 20/min).

**Request:**
```json
{
  "submissionId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "selectedOptionIds": ["uuid1", "uuid2"]
    }
  ]
}
```

#### `POST /submissions/:id/submit`
Manually submit exam (rate limited: 5/min).

#### `GET /submissions/:id/result`
Get exam result (rate limited: 30/min).

**Response:**
```json
{
  "totalMarks": 85,
  "aptitudeMarks": 40,
  "technicalMarks": 45,
  "selectedForNextRound": true
}
```

---

## Database Schema

### Core Models

#### User
- `id`, `email`, `passwordHash`, `role`, `firstName`, `lastName`
- `collegeSessionId`, `isActive`
- Soft delete support (`deletedAt`)

#### Exam
- `id`, `title`, `description`
- `windowStartsAt`, `windowEndsAt`, `durationSeconds`
- `isPublished`, `masterPasswordHash`
- Relations: `collegeSessionId`, `createdBy`

#### Submission
- `id`, `examId`, `examSetId`, `userId`
- `startedAt`, `submittedAt`, `autoSubmitted`
- Soft delete support

#### FinalResult
- `id`, `submissionId`
- `totalMarks`, `aptitudeMarks`, `technicalMarks`
- `rank`, `selectedForNextRound`
- Monitoring fields: `tabSwitchCount`, `screenshotTaken`, `kicked`

#### Question & Options
- Questions have `category` (aptitude/technical), `type` (single/multi-select)
- Options have `isCorrect` flag for scoring

### Key Indexes

Performance indexes added for production:
- `FinalResult`: `rank`, `selectedForNextRound`, `[submissionId, rank]`
- `SubmissionScore`: `submissionId`
- `SubmissionAnswer`: `submissionScoreId`
- `ExamSet`: `examId`
- `RecruitmentSession`: `collegeId`, `status`, `createdBy`

---

## Authentication & Authorization

### JWT Authentication

1. **Login** (`POST /auth/login`):
   - Validates email/password
   - Returns `accessToken` (15min) and `refreshToken` (7d)

2. **Protected Routes**:
   - Include header: `Authorization: Bearer <accessToken>`
   - Token validated by `JwtAuthGuard`

3. **Role-Based Access**:
   - Use `@Roles('admin', 'moderator')` decorator
   - Enforced by `RolesGuard`
   - Available roles: `admin`, `moderator`, `candidate`

### Guards

- **JwtAuthGuard**: Validates JWT token
- **RolesGuard**: Enforces role-based access

### Decorators

- `@GetUser('sub')` - Extract user ID from token
- `@Roles('admin')` - Require specific role(s)

### Example Usage

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class AdminController {
  @Get('users')
  listUsers(@GetUser('sub') userId: string) {
    // userId extracted from JWT
  }
}
```

---

## Development Guidelines

### Code Style

1. **TypeScript Strict Mode**: All code must pass strict type checking
2. **Explicit Return Types**: All methods must have explicit return types
3. **No `any` Types**: Avoid `any`, use proper types
4. **ESLint Compliance**: Code must pass ESLint without warnings

### Architectural Rules

1. **Controller → Service → Repository**:
   ```typescript
   // ✅ Correct
   Controller → Service → Repository → Prisma
   
   // ❌ Wrong
   Controller → Repository (bypasses service)
   Controller → Prisma (direct access)
   ```

2. **No Cross-Domain Repository Calls**:
   ```typescript
   // ✅ Correct
   ServiceA → ServiceB (service calls service)
   
   // ❌ Wrong
   ServiceA → RepositoryB (service calls other domain's repository)
   ```

3. **DTO Validation**:
   - All inputs must use DTOs with `class-validator` decorators
   - Use `@IsUUID()`, `@IsString()`, `@IsOptional()`, etc.

4. **Error Handling**:
   - Use NestJS exceptions: `NotFoundException`, `ForbiddenException`, `BadRequestException`, `InternalServerErrorException`
   - Never throw raw `Error` objects
   - Log errors before throwing

5. **Logging**:
   - Use NestJS `Logger` (not `console.log`)
   - Log business actions: `logger.log('User created: userId=xxx')`
   - Never log sensitive data (passwords, tokens)

### Database Operations

1. **Use Repositories**: All Prisma calls go through repositories
2. **Select Statements**: Always use `select` to avoid exposing sensitive fields
3. **Transactions**: Use `$transaction` for multi-step operations
4. **Batch Operations**: Use batch methods to avoid N+1 queries

### Example: Adding a New Feature

1. **Create Module Structure**:
   ```
   modules/my-feature/
   ├── my-feature.module.ts
   ├── my-feature.controller.ts
   ├── my-feature.service.ts
   ├── my-feature.repository.ts (if needed)
   └── dto/
       ├── create-my-feature.dto.ts
       └── update-my-feature.dto.ts
   ```

2. **Implement Repository** (if needed):
   ```typescript
   @Injectable()
   export class MyFeatureRepository {
     constructor(private readonly prisma: PrismaService) {}
     
     async findById(id: string): Promise<MyFeature | null> {
       return this.prisma.myFeature.findUnique({
         where: { id },
         select: { /* explicit select */ },
       });
     }
   }
   ```

3. **Implement Service**:
   ```typescript
   @Injectable()
   export class MyFeatureService {
     constructor(
       private readonly repository: MyFeatureRepository,
     ) {}
     
     async getFeature(id: string): Promise<MyFeatureDto> {
       const feature = await this.repository.findById(id);
       if (!feature) {
         throw new NotFoundException('Feature not found');
       }
       return feature;
     }
   }
   ```

4. **Implement Controller**:
   ```typescript
   @Controller('my-feature')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   export class MyFeatureController {
     constructor(private readonly service: MyFeatureService) {}
     
     @Get(':id')
     getFeature(@Param('id') id: string) {
       return this.service.getFeature(id);
     }
   }
   ```

---

## Testing

### Unit Tests

```bash
pnpm run test
```

Tests are located alongside source files with `.spec.ts` extension.

### E2E Tests

```bash
pnpm run test:e2e
```

E2E tests are in the `test/` directory.

### Test Coverage

```bash
pnpm run test:cov
```

---

## Deployment

### Production Build

```bash
# Build
pnpm run build

# Start
pnpm run start:prod
```

### Environment Variables

Ensure all required environment variables are set:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`

### Database Migrations

```bash
# Run migrations
pnpm prisma migrate deploy
```

### Production Considerations

1. **Connection Pooling**: Configured in `PrismaService` (max: 20, min: 5)
2. **Rate Limiting**: Global 100 req/min, stricter limits on sensitive endpoints
3. **Logging**: Structured logging for observability
4. **Error Handling**: Consistent error responses
5. **Indexes**: Performance indexes added for production scale

### Health Checks

Consider adding a health check endpoint:
```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date() };
}
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check `DATABASE_URL` format
   - Verify PostgreSQL is running
   - Check connection pool settings

2. **JWT Token Errors**:
   - Verify `JWT_ACCESS_SECRET` is set
   - Check token expiration
   - Ensure `Authorization` header format is correct

3. **Prisma Client Errors**:
   ```bash
   pnpm prisma generate
   ```

4. **Type Errors**:
   ```bash
   pnpm run build  # Check for TypeScript errors
   ```

5. **Rate Limiting**:
   - Check throttler configuration
   - Verify rate limit headers in response

### Debugging

1. **Enable Debug Logging**:
   ```typescript
   // In service
   this.logger.debug('Debug message', { context });
   ```

2. **Database Queries**:
   - Enable Prisma query logging in development
   - Check slow query logs

3. **API Testing**:
   - Use Postman/Insomnia for endpoint testing
   - Check request/response headers

---

## Additional Resources

### Documentation Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Code Examples

See existing modules for reference implementations:
- `modules/scoring/` - Complex business logic with batch processing
- `modules/exam-runtime/` - Real-time operations with rate limiting
- `modules/admin/` - CRUD operations with filtering

---

## Support

For questions or issues:
1. Check this documentation
2. Review existing code examples
3. Consult NestJS/Prisma documentation
4. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0

