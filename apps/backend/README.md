# Backend API - Online Assessment System

A production-ready NestJS 11 backend for an online examination and assessment platform.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete technical documentation

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env  # Edit with your credentials

# Setup database
pnpm prisma generate
pnpm prisma migrate dev

# Start development server
pnpm run start:dev
```

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

## 📋 Overview

This backend provides:
- **Multi-role authentication** (Admin, Moderator, Candidate)
- **Exam management** with multiple question sets
- **Real-time exam execution** with answer submission
- **Automated scoring and ranking**
- **Bulk candidate management** via CSV
- **Result filtering and pagination**

## 🛠️ Technology Stack

- **NestJS 11** - Progressive Node.js framework
- **TypeScript 5.7** - Type-safe development
- **PostgreSQL** - Relational database
- **Prisma 7** - Type-safe ORM
- **JWT** - Authentication
- **Rate Limiting** - API protection

## 📁 Project Structure

```
apps/backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── admin/        # Admin operations
│   │   ├── candidates/   # Candidate management
│   │   ├── exams/        # Exam management
│   │   ├── exam-runtime/ # Exam execution
│   │   └── scoring/      # Scoring & ranking
│   ├── config/           # Configuration
│   └── prisma/           # Database module
└── prisma/
    ├── schema.prisma     # Database schema
    └── migrations/       # Database migrations
```

## 🔐 Authentication

All protected endpoints require JWT authentication:

```bash
Authorization: Bearer <accessToken>
```

Roles: `admin`, `moderator`, `candidate`

## 📖 Available Scripts

```bash
pnpm run start:dev      # Development with hot-reload
pnpm run build          # Build for production
pnpm run start:prod     # Production server
pnpm run lint           # Lint code
pnpm run test           # Run tests
pnpm run test:cov       # Test coverage
```

## 🏗️ Architecture

Strict **Controller → Service → Repository** pattern:
- Controllers handle HTTP requests
- Services contain business logic
- Repositories handle database operations
- No direct Prisma access from controllers

## 📝 Key Features

- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ Structured logging
- ✅ Batch processing for large datasets
- ✅ Database connection pooling
- ✅ Production-ready error handling
- ✅ Type-safe with strict TypeScript

## 🔗 Resources

- [Full Documentation](./DOCUMENTATION.md)
- [Quick Start Guide](./QUICK_START.md)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
