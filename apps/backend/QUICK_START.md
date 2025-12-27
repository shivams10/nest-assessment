# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites Check
```bash
node --version    # Should be 18+
pnpm --version   # Should be installed
psql --version   # PostgreSQL 14+
```

### 2. Setup Environment
```bash
cd apps/backend

# Copy and edit .env file
cp .env.example .env  # Edit with your database credentials
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_ACCESS_SECRET="your-secret-key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
```

### 3. Install & Setup Database
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed database
pnpm prisma db seed
```

### 4. Start Development Server
```bash
pnpm run start:dev
```

Server runs on `http://localhost:3000`

---

## 📋 Common Tasks

### Create a New Admin User
```bash
# Via API (after starting server)
curl -X POST http://localhost:3000/admin/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password"
  }'
```

### Start an Exam (Candidate)
```bash
curl -X POST http://localhost:3000/exam-attempts/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <candidate-token>" \
  -d '{
    "examId": "exam-uuid"
  }'
```

### Submit Answers
```bash
curl -X POST http://localhost:3000/exam-runtime/answers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <candidate-token>" \
  -d '{
    "submissionId": "submission-uuid",
    "answers": [
      {
        "questionId": "question-uuid",
        "selectedOptionIds": ["option-uuid-1", "option-uuid-2"]
      }
    ]
  }'
```

---

## 🔧 Development Commands

```bash
# Development
pnpm run start:dev      # Hot-reload development server
pnpm run start:debug    # Debug mode

# Code Quality
pnpm run lint           # Check and fix linting issues
pnpm run format         # Format code with Prettier

# Database
pnpm prisma studio      # Open Prisma Studio (GUI)
pnpm prisma migrate dev # Create and apply migration
pnpm prisma generate    # Regenerate Prisma client

# Testing
pnpm run test           # Run unit tests
pnpm run test:watch     # Watch mode
pnpm run test:cov       # Coverage report
```

---

## 📁 Project Structure Overview

```
apps/backend/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Root module
│   ├── config/              # Configuration
│   ├── prisma/              # Database module
│   └── modules/             # Feature modules
│       ├── auth/            # Authentication
│       ├── admin/           # Admin operations
│       ├── candidates/      # Candidate management
│       ├── exams/           # Exam management
│       ├── exam-attempts/   # Starting exams
│       ├── exam-runtime/    # Exam execution
│       └── scoring/         # Scoring & ranking
└── prisma/
    ├── schema.prisma        # Database schema
    └── migrations/          # Database migrations
```

---

## 🔐 Authentication Flow

1. **Login** → Get `accessToken` and `refreshToken`
2. **Use Token** → Include in header: `Authorization: Bearer <accessToken>`
3. **Access Protected Routes** → Guards validate token and role

### Roles
- `admin` - Full access
- `moderator` - Admin operations (except creating admins)
- `candidate` - Exam taking only

---

## 🎯 Key Endpoints

| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/auth/login` | POST | ❌ | - |
| `/admin/users` | GET | ✅ | admin, moderator |
| `/admin/results` | GET | ✅ | admin, moderator |
| `/exam-attempts/start` | POST | ✅ | candidate |
| `/exam-runtime` | GET | ✅ | candidate |
| `/exam-runtime/answers` | POST | ✅ | candidate |
| `/submissions/:id/submit` | POST | ✅ | candidate |
| `/submissions/:id/result` | GET | ✅ | candidate |

---

## 🐛 Troubleshooting

### Server won't start
- Check `.env` file exists and has all variables
- Verify PostgreSQL is running
- Check port 3000 is available

### Database errors
```bash
# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset

# Check connection
pnpm prisma db pull
```

### Type errors
```bash
# Regenerate Prisma client
pnpm prisma generate

# Rebuild
pnpm run build
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

---

## 📚 Next Steps

1. Read [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed information
2. Explore existing modules to understand patterns
3. Check API endpoints with Postman/Insomnia
4. Review database schema in `prisma/schema.prisma`

---

**Need Help?** Check the full [DOCUMENTATION.md](./DOCUMENTATION.md) or contact the development team.

