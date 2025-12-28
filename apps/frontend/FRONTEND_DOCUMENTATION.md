# Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Features Implemented](#features-implemented)
6. [Authentication & Authorization](#authentication--authorization)
7. [Routing](#routing)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Components](#components)
11. [Error Handling](#error-handling)
12. [Performance Optimizations](#performance-optimizations)
13. [Accessibility](#accessibility)
14. [Key Files Reference](#key-files-reference)

---

## Project Overview

This is a **Vite + React + TypeScript** frontend application for an exam assessment system. It's part of a monorepo and provides interfaces for three user roles:
- **Admin**: Full system access, analytics, user management, results management
- **Moderator**: Similar to admin but cannot create other admins
- **Candidate**: Take exams, view results

The application follows a **production-grade, scalable architecture** with strict separation of concerns, type safety, and modern React patterns.

---

## Tech Stack

### Core
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Build tool and dev server

### State Management
- **Redux Toolkit 2.11.2** - Global state (auth only)
- **TanStack Query 5.90.12** - Server state management (ALL API calls)

### Forms & Validation
- **React Hook Form 7.69.0** - Form management
- **Zod 4.1.13** - Schema validation
- **@hookform/resolvers 5.2.2** - Form validation integration

### UI & Styling
- **Tailwind CSS 3.4.0** - Utility-first CSS
- **Shadcn UI** - Component library (built on Radix UI)
- **class-variance-authority** - Component variants
- **tailwind-merge** - Tailwind class merging

### Routing
- **React Router DOM 7.11.0** - Client-side routing

### HTTP Client
- **Axios 1.13.2** - HTTP requests (ONLY in API layer)

### Key Principles
- **No direct Axios in components** - All API calls go through services → React Query hooks
- **TanStack Query everywhere** - All server interactions use React Query
- **Redux for auth only** - Global state limited to authentication
- **Fully typed** - TypeScript throughout
- **Mobile-first responsive** - All components are responsive
- **Accessible** - ARIA labels, keyboard navigation, semantic HTML

---

## Architecture

### Data Flow Pattern

```
Component → React Query Hook → Service → Axios (apiClient) → Backend API
                ↓
         Redux (auth state only)
```

### Key Architectural Rules

1. **API Layer Separation**
   - `apiClient` (axios instance) in `src/lib/axios.ts`
   - Services in `src/services/` or `src/api/`
   - React Query hooks in `src/queries/` or `src/hooks/queries/`
   - Components NEVER use axios directly

2. **State Management**
   - **Redux**: Authentication state only (token, role, isAuthenticated)
   - **TanStack Query**: All server state (exams, results, users, analytics)
   - **React Hook Form**: Form state
   - **React State**: Local component state only

3. **Error Handling**
   - Centralized error formatter (`src/utils/errorFormatter.ts`)
   - ErrorBoundary for React errors
   - ErrorPage for route errors
   - React Query handles API errors

4. **Performance**
   - Query staleTime tuning
   - Prefetching for better UX
   - Memoization for heavy calculations
   - Lazy loading for routes

---

## Folder Structure

```
apps/frontend/src/
├── api/                    # API service functions
│   ├── analytics.api.ts
│   ├── exam.runtime.api.ts
│   └── results.api.ts
├── components/
│   ├── admin/              # Admin layout components
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminTopbar.tsx
│   ├── analytics/          # Analytics components
│   │   ├── SimpleBarChart.tsx
│   │   └── StatsCard.tsx
│   ├── candidate/          # Candidate layout components
│   │   ├── CandidateLayout.tsx
│   │   ├── CandidateSidebar.tsx
│   │   └── CandidateTopbar.tsx
│   ├── exam/               # Exam runtime components
│   │   └── components/
│   │       ├── ExamHeader.tsx
│   │       ├── OptionItem.tsx
│   │       ├── QuestionCard.tsx
│   │       └── SubmitDialog.tsx
│   ├── results/            # Result display components
│   │   └── components/
│   │       ├── RankBadge.tsx
│   │       ├── ResultSummaryCard.tsx
│   │       └── StatusBadge.tsx
│   ├── shared/             # Shared/reusable components
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingState.tsx
│   │   └── SkeletonLoader.tsx
│   ├── ui/                 # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── ErrorBoundary.tsx   # Global error boundary
├── constants/              # Application constants
│   ├── navigation.ts      # Navigation config
│   ├── roles.ts           # Role constants
│   ├── routes.ts          # Route paths
│   └── text.ts            # Text constants
├── hooks/
│   ├── queries/           # React Query hooks
│   │   ├── useAdmin.ts
│   │   ├── useAuth.ts
│   │   ├── useExamAttempts.ts
│   │   └── useExams.ts
│   ├── useAuth.ts         # Auth hook (Redux)
│   ├── useDebouncedMutation.ts
│   ├── useExamTimer.ts
│   └── useTabMonitoring.ts
├── lib/                   # Core utilities
│   ├── axios.ts           # Axios instance + interceptors
│   ├── auth.ts            # Auth helpers
│   ├── auth-redirect.ts   # Role-based redirects
│   ├── form-utils.ts      # Form utilities
│   ├── jwt.ts             # JWT utilities
│   └── utils.ts           # General utilities
├── pages/
│   ├── admin/             # Admin pages
│   │   ├── AdminAnalyticsPage.tsx
│   │   ├── AdminCandidatesPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminExamsPage.tsx
│   │   ├── AdminResultsPage.tsx
│   │   └── UsersListPage.tsx
│   ├── auth/               # Auth pages
│   │   ├── login.tsx
│   │   └── schemas/
│   │       └── login.schema.ts
│   ├── candidate/          # Candidate pages
│   │   ├── ExamListPage.tsx
│   │   ├── ExamResultPage.tsx
│   │   ├── ExamRuntimePage.tsx
│   │   ├── ExamStartPage.tsx
│   │   └── ExamSuccessPage.tsx
│   ├── exam/               # Standalone exam pages
│   │   ├── ExamRuntimePage.tsx
│   │   ├── ExamStartPage.tsx
│   │   └── components/
│   ├── results/            # Result pages
│   │   ├── CandidateResultPage.tsx
│   │   └── components/
│   └── ErrorPage.tsx        # Route error page
├── queries/                 # React Query hooks (organized by domain)
│   ├── analytics.queries.ts
│   ├── examRuntime.queries.ts
│   └── results.queries.ts
├── routes/                  # Route configuration
│   ├── AdminGuard.tsx       # Admin/moderator guard
│   ├── AuthGuard.tsx        # Prevent auth users from public routes
│   ├── CandidateGuard.tsx   # Candidate guard
│   ├── ProtectedRoute.tsx   # Auth required guard
│   ├── index.tsx            # Root router
│   ├── protected.routes.tsx # Protected routes
│   └── public.routes.tsx    # Public routes
├── schemas/                 # Zod schemas
│   └── examAnswer.schema.ts
├── services/                # API service functions
│   ├── admin.service.ts
│   ├── auth.service.ts
│   ├── exam-attempts.service.ts
│   ├── exam-runtime.service.ts
│   └── exams.service.ts
├── store/                   # Redux store
│   ├── index.ts             # Store configuration
│   └── slices/
│       └── auth.slice.ts    # Auth state slice
├── types/                   # TypeScript types
│   ├── analytics.types.ts
│   ├── result.types.ts
│   └── ...
└── utils/                   # Utility functions
    └── errorFormatter.ts    # Error formatting
```

---

## Features Implemented

### Phase 1-2: Authentication & Login
- ✅ Login page with email/password
- ✅ React Hook Form + Zod validation
- ✅ JWT token storage in Redux
- ✅ Role-based redirects after login
- ✅ Refresh token interceptor
- ✅ Auto token refresh on 401
- ✅ Token persistence in localStorage

### Phase 3-4: Admin Layout & Role-Based Access
- ✅ Admin layout (Sidebar + Topbar + Content)
- ✅ Role-based route guards (AdminGuard, CandidateGuard)
- ✅ Admin sidebar navigation (Dashboard, Exams, Candidates, Results, Analytics, Users)
- ✅ Admin topbar (user email, role, logout)
- ✅ Candidate layout (Sidebar + Topbar + Content)
- ✅ Responsive design (mobile-first)

### Phase 5-6: Candidate Exam Flow
- ✅ Exam list page (published exams)
- ✅ Exam start page (instructions, duration)
- ✅ Exam runtime page:
  - Backend-driven timer (30s sync)
  - Question navigation (Previous/Next)
  - Single-select and multi-select questions
  - Auto-save answers (debounced 500ms)
  - Tab monitoring (warnings, auto-submit on violations)
  - Manual submit with confirmation
  - Auto-submit on timer expiry
- ✅ Exam success page
- ✅ Result page (marks, rank, selection status)

### Phase 7-8: Admin Management
- ✅ Users list page (pagination, role filters)
- ✅ Results list page:
  - Pagination
  - Filters (exam, college session, selection status)
  - Sorting (rank, total marks, submitted date)
  - Toggle "Selected for Next Round"
  - Recalculate rankings
  - View candidate result

### Phase 9: Exam Runtime Experience
- ✅ Real-time timer sync (30s intervals)
- ✅ Answer submission with optimistic updates
- ✅ Tab visibility monitoring
- ✅ Debounced auto-save
- ✅ Keyboard accessible
- ✅ Mobile responsive

### Phase 10: Results Management
- ✅ Candidate result page (read-only)
- ✅ Admin results listing with filters
- ✅ Rank badges and status badges
- ✅ Result breakdown charts
- ✅ Toggle selection for next round
- ✅ Recalculate ranks

### Phase 11: Analytics & Performance
- ✅ Admin analytics dashboard:
  - Summary cards (candidates, exams, submissions, selected)
  - Exam-wise statistics (avg, highest, lowest, pass rate)
  - Bar charts (CSS-based, no external libraries)
- ✅ Performance optimizations:
  - Query staleTime tuning
  - Prefetching (candidate result after submission)
  - Memoization for chart data
- ✅ Error handling:
  - Centralized error formatter
  - User-friendly error messages
  - ErrorBoundary for React errors
  - ErrorPage for route errors
- ✅ Accessibility:
  - Skeleton loaders
  - Keyboard navigation
  - Focus states
  - ARIA labels

---

## Authentication & Authorization

### Authentication Flow

1. **Login** (`POST /auth/login`)
   - User enters email/password
   - On success: `accessToken` stored in Redux
   - JWT decoded to extract role
   - Redirect based on role:
     - Admin/Moderator → `/admin`
     - Candidate → `/candidate/exams`

2. **Token Refresh** (Automatic)
   - On 401 response:
     - Call `POST /auth/refresh` (no body)
     - Update `accessToken` in Redux
     - Retry original request
   - Prevents infinite loops
   - Queues requests during refresh

3. **Token Persistence**
   - Token stored in `localStorage`
   - Restored on app load
   - Expired tokens cleared on load

### Authorization

**Route Guards:**
- `ProtectedRoute`: Requires authentication
- `AdminGuard`: Requires admin or moderator role
- `CandidateGuard`: Requires candidate role
- `AuthGuard`: Prevents authenticated users from accessing public routes (e.g., `/login`)

**Role Constants:**
```typescript
ROLES.ADMIN = 'admin'
ROLES.MODERATOR = 'moderator'
ROLES.CANDIDATE = 'candidate'
ADMIN_ROLES = ['admin', 'moderator']
```

**Navigation Filtering:**
- Sidebar items filtered by `allowedRoles`
- "Users" visible only to admins

---

## Routing

### Route Structure

```
/ (HOME) - Protected
├── /login - Public (redirects if authenticated)
├── /unauthorized - Public
└── Protected Routes
    ├── /admin - Admin Dashboard
    │   ├── /admin/exams - Exam Management (Coming Soon)
    │   ├── /admin/candidates - Candidate Management (Coming Soon)
    │   ├── /admin/results - Results Management
    │   ├── /admin/analytics - Analytics Dashboard
    │   └── /admin/users - User Management
    ├── /candidate/exams - Exam List
    │   ├── /candidate/exams/:examId/start - Exam Start
    │   ├── /candidate/exams/:submissionId/runtime - Exam Runtime
    │   ├── /candidate/exams/:submissionId/success - Exam Success
    │   └── /candidate/exams/:submissionId/result - Exam Result
    ├── /exam/:submissionId/start - Standalone Exam Start
    ├── /exam/:submissionId - Standalone Exam Runtime
    └── /submissions/:submissionId/result - Candidate Result
```

### Route Configuration

**Public Routes** (`src/routes/public.routes.tsx`):
- `/login` - Login page
- `/unauthorized` - Access denied page

**Protected Routes** (`src/routes/protected.routes.tsx`):
- All routes wrapped in `ProtectedRoute`
- Admin routes wrapped in `AdminGuard` + `AdminLayout`
- Candidate routes wrapped in `CandidateGuard` + `CandidateLayout`
- All routes have `errorElement: <ErrorPage />`

### Route Constants

All routes defined in `src/constants/routes.ts`:
```typescript
ROUTES.ADMIN = '/admin'
ROUTES.ADMIN_RESULTS = '/admin/results'
ROUTES.ADMIN_ANALYTICS = '/admin/analytics'
ROUTES.ADMIN_USERS = '/admin/users'
ROUTES.CANDIDATE_EXAMS = '/candidate/exams'
// ... etc
```

---

## State Management

### Redux (Auth Only)

**Store Location:** `src/store/`

**Auth Slice** (`src/store/slices/auth.slice.ts`):
```typescript
interface AuthState {
  token: string | null
  role: UserRole | null
  isAuthenticated: boolean
}
```

**Actions:**
- `setAuthToken(token)` - Set token and decode role
- `setAccessToken(token)` - Update token during refresh
- `logout()` - Clear all auth state
- `loadTokenFromStorage()` - Restore token on app load

**Usage:**
```typescript
import { useAuth } from '@/hooks/useAuth'
const { role, isAuthenticated } = useAuth()
```

### TanStack Query (All Server State)

**Query Keys Pattern:**
```typescript
// Factory pattern for stable keys
export const resultsKeys = {
  all: ['results'] as const,
  candidate: (id: string) => [...resultsKeys.all, 'candidate', id] as const,
  admin: (params) => [...resultsKeys.all, 'admin', params] as const,
}
```

**StaleTime Configuration:**
- Analytics: 5 minutes (stable data)
- Results: 2 minutes (candidate), 30 seconds (admin list)
- Exams: 2 minutes
- Exam runtime: 30 seconds (timer sync)

**Prefetching:**
- Candidate result prefetched after exam submission
- Admin results prefetched when navigating from analytics

---

## API Integration

### Architecture Pattern

```
Component
  ↓
React Query Hook (useQuery/useMutation)
  ↓
Service Function (apiClient.get/post/patch)
  ↓
Axios Interceptor (refresh token, error handling)
  ↓
Backend API
```

### API Client

**Location:** `src/lib/axios.ts`

**Features:**
- Base URL configuration
- Request interceptor: Adds `Authorization: Bearer <token>`
- Response interceptor: Handles 401, refreshes token, retries request
- Prevents infinite refresh loops
- Queues requests during refresh

### Service Functions

**Location:** `src/services/` and `src/api/`

**Pattern:**
```typescript
export async function listExamsService(params?: ListExamsParams): Promise<ListExamsResponse> {
  try {
    const response = await apiClient.get<ListExamsResponse>('/exams', { params })
    return response.data
  } catch (error) {
    // Error handling
    throw customError
  }
}
```

### React Query Hooks

**Location:** `src/queries/` and `src/hooks/queries/`

**Pattern:**
```typescript
export function useExams(params?: ListExamsParams) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => listExamsService(params),
    staleTime: 2 * 60 * 1000,
  })
}
```

**Mutations:**
```typescript
export function useSubmitExam(submissionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => submitExamService(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] })
    },
  })
}
```

---

## Components

### Layout Components

**AdminLayout** (`src/components/admin/AdminLayout.tsx`):
- Flexbox layout
- Sidebar (left), Topbar (top), Content (outlet)
- Responsive (sidebar hidden on mobile)

**AdminSidebar** (`src/components/admin/AdminSidebar.tsx`):
- Navigation items from `ADMIN_NAVIGATION` config
- Role-based filtering
- Active route highlighting
- Mobile overlay

**AdminTopbar** (`src/components/admin/AdminTopbar.tsx`):
- User email and role display
- Logout button
- Mobile menu toggle

**CandidateLayout** - Similar structure for candidate pages

### Shared Components

**LoadingState** (`src/components/shared/LoadingState.tsx`):
- Spinner with message
- Used for initial page loads

**ErrorState** (`src/components/shared/ErrorState.tsx`):
- Error message with retry button
- Used for API errors

**EmptyState** (`src/components/shared/EmptyState.tsx`):
- Empty state message
- Used when no data available

**SkeletonLoader** (`src/components/shared/SkeletonLoader.tsx`):
- Skeleton cards for better loading UX
- Used in analytics dashboard

### Analytics Components

**StatsCard** (`src/components/analytics/StatsCard.tsx`):
- Reusable statistics card
- Title, value, description, optional trend

**SimpleBarChart** (`src/components/analytics/SimpleBarChart.tsx`):
- CSS-based bar chart (no external libraries)
- Accessible (ARIA labels, progressbar role)
- Responsive

### Exam Components

**ExamHeader** (`src/pages/exam/components/ExamHeader.tsx`):
- Fixed header with exam title
- Countdown timer
- Save and Submit buttons

**QuestionCard** (`src/pages/exam/components/QuestionCard.tsx`):
- Displays single question
- Renders options using OptionItem

**OptionItem** (`src/pages/exam/components/OptionItem.tsx`):
- Radio (single-select) or checkbox (multi-select)
- Keyboard accessible
- Visual feedback

**SubmitDialog** (`src/pages/exam/components/SubmitDialog.tsx`):
- Confirmation dialog for exam submission
- Simple modal (no external dependencies)

### Result Components

**ResultSummaryCard** (`src/pages/results/components/ResultSummaryCard.tsx`):
- Total marks display
- Aptitude/Technical breakdown
- Rank and selection status badges

**RankBadge** (`src/pages/results/components/RankBadge.tsx`):
- Color-coded rank display
- Special styling for top 3, top 10

**StatusBadge** (`src/pages/results/components/StatusBadge.tsx`):
- "Selected for Next Round" status
- Green for selected, muted for not selected

---

## Error Handling

### Error Formatter

**Location:** `src/utils/errorFormatter.ts`

**Purpose:**
- Converts technical errors to user-friendly messages
- No raw backend errors or stack traces exposed
- Handles network, timeout, 401, 403, 404, 500 errors

**Usage:**
```typescript
import { formatError } from '@/utils/errorFormatter'
const formattedError = formatError(error)
// Returns: { title: string, message: string, canRetry: boolean }
```

### ErrorBoundary

**Location:** `src/components/ErrorBoundary.tsx`

**Purpose:**
- Catches React render/runtime errors
- Does NOT handle API errors (React Query handles those)
- Uses error formatter for user-friendly messages
- Wrapped around RouterProvider in `App.tsx`

### ErrorPage

**Location:** `src/pages/ErrorPage.tsx`

**Purpose:**
- Handles route-level errors (loaders, actions, rendering)
- Uses `useRouteError()` from React Router
- Uses error formatter
- All routes have `errorElement: <ErrorPage />`

### React Query Error Handling

- Errors caught in `onError` callbacks
- Formatted using error formatter
- Displayed via ErrorState component
- Retry logic handled by React Query

---

## Performance Optimizations

### Query staleTime Tuning

**Analytics:** 5 minutes (stable data)
```typescript
staleTime: 5 * 60 * 1000
```

**Results:** 2 minutes (candidate), 30 seconds (admin list)
```typescript
staleTime: 2 * 60 * 1000 // candidate
staleTime: 30 * 1000 // admin list
```

**Exams:** 2 minutes
```typescript
staleTime: 2 * 60 * 1000
```

**Exam Runtime:** 30 seconds (timer sync)
```typescript
refetchInterval: 30000
```

### Prefetching

**Candidate Result:**
- Prefetched after exam submission
- Improves UX when navigating to result page

**Admin Results:**
- Can be prefetched when navigating from analytics

### Memoization

**Chart Data:**
- `useMemo` for chart data calculations
- Prevents unnecessary recalculations on re-renders

**Example:**
```typescript
const chartData = useMemo(() => {
  if (!data || !data.examStats) return []
  return data.examStats.map(stat => ({
    label: stat.examTitle,
    value: stat.averageScore,
    // ...
  }))
}, [data])
```

### Lazy Loading

- All routes use `lazy` loading
- Reduces initial bundle size
- Code splitting automatic

---

## Accessibility

### ARIA Labels

- All interactive elements have `aria-label`
- Form inputs have associated labels
- Buttons have descriptive text

### Keyboard Navigation

- All interactive elements keyboard accessible
- Tab order logical
- Focus states visible
- Enter/Space activate buttons

### Semantic HTML

- Proper heading hierarchy (h1, h2, h3)
- Semantic elements (nav, main, header, footer)
- Form elements properly labeled

### Screen Reader Support

- Progress bars use `role="progressbar"`
- Lists use `role="list"` and `role="listitem"`
- Error messages associated with inputs
- Status updates announced

---

## Key Files Reference

### Configuration Files

**`src/lib/axios.ts`**
- Axios instance configuration
- Request/response interceptors
- Refresh token logic

**`src/store/index.ts`**
- Redux store configuration
- Auth slice registration

**`src/routes/index.tsx`**
- Root router configuration
- Combines public and protected routes
- ErrorBoundary wrapper

### Constants

**`src/constants/routes.ts`**
- All route paths
- Type-safe route constants

**`src/constants/roles.ts`**
- Role definitions
- Role arrays (ADMIN_ROLES, etc.)

**`src/constants/navigation.ts`**
- Navigation configuration
- Sidebar items with role restrictions

**`src/constants/text.ts`**
- All user-facing text
- Centralized for i18n readiness

### Hooks

**`src/hooks/useAuth.ts`**
- Redux auth state hook
- Returns: `{ role, isAuthenticated, token }`

**`src/hooks/useExamTimer.ts`**
- Exam countdown timer
- Calculates remaining time from backend data
- Auto-submit on expiry

**`src/hooks/useTabMonitoring.ts`**
- Detects tab switches/blur events
- Calls monitoring API
- Shows warnings, disables exam after max violations

**`src/hooks/useDebouncedMutation.ts`**
- Debounces TanStack Query mutations
- Used for auto-save answers

### Pages

**Admin Pages:**
- `AdminDashboardPage.tsx` - Main dashboard with quick actions
- `AdminAnalyticsPage.tsx` - Analytics dashboard
- `AdminResultsPage.tsx` - Results management
- `UsersListPage.tsx` - User management
- `AdminExamsPage.tsx` - Coming soon placeholder
- `AdminCandidatesPage.tsx` - Coming soon placeholder

**Candidate Pages:**
- `ExamListPage.tsx` - List of available exams
- `ExamStartPage.tsx` - Exam instructions and start button
- `ExamRuntimePage.tsx` - Exam taking interface
- `ExamSuccessPage.tsx` - Success message after submission
- `ExamResultPage.tsx` - Exam result display

**Result Pages:**
- `CandidateResultPage.tsx` - Candidate's view of their result

### Services

**`src/services/auth.service.ts`**
- Login, refresh token services

**`src/services/exams.service.ts`**
- List exams (admin/candidate)

**`src/services/exam-attempts.service.ts`**
- Start exam service

**`src/services/exam-runtime.service.ts`**
- Get exam, submit answers, submit exam, get result

**`src/services/admin.service.ts`**
- List users, list results (admin)

**`src/api/analytics.api.ts`**
- Get analytics data (aggregates from multiple endpoints)

**`src/api/results.api.ts`**
- Get candidate result, list admin results, toggle selection, recalculate ranks

### Queries

**`src/queries/analytics.queries.ts`**
- `useAnalytics()` - Fetch analytics data

**`src/queries/examRuntime.queries.ts`**
- `useExam()` - Fetch exam data (30s refetch)
- `useSubmitAnswers()` - Submit answers mutation
- `useSubmitExam()` - Submit exam mutation
- `useStartExam()` - Start exam mutation
- `useMonitoringEvent()` - Submit monitoring event

**`src/queries/results.queries.ts`**
- `useCandidateResult()` - Fetch candidate result
- `useAdminResults()` - Fetch admin results list
- `useToggleNextRound()` - Toggle selection mutation
- `useRecalculateRanks()` - Recalculate ranks mutation

---

## Development Guidelines

### Adding New Features

1. **API Integration:**
   - Create service function in `src/services/` or `src/api/`
   - Create React Query hook in `src/queries/` or `src/hooks/queries/`
   - Use hook in component

2. **New Page:**
   - Create page in `src/pages/`
   - Add route in `src/routes/protected.routes.tsx` or `public.routes.tsx`
   - Add route constant in `src/constants/routes.ts`
   - Add `errorElement: <ErrorPage />`

3. **New Component:**
   - Create in appropriate folder (`components/admin/`, `components/shared/`, etc.)
   - Use Shadcn UI components
   - Make it responsive and accessible
   - Add TypeScript types

4. **Constants:**
   - Add text to `src/constants/text.ts`
   - Add routes to `src/constants/routes.ts`
   - Add navigation items to `src/constants/navigation.ts`

### Code Quality Rules

- ✅ No direct axios in components
- ✅ All API calls through React Query
- ✅ Redux only for auth
- ✅ Fully typed (no `any`)
- ✅ Mobile-first responsive
- ✅ Accessible (ARIA, keyboard)
- ✅ Error handling everywhere
- ✅ No console.logs (use error formatter)
- ✅ Reusable components
- ✅ Clean separation of concerns

---

## Build & Deployment

### Build Command
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Type Checking
```bash
tsc -b
```

---

## Summary

This frontend application is a **production-grade, scalable React application** with:

- ✅ Complete authentication flow with JWT and refresh tokens
- ✅ Role-based access control (admin, moderator, candidate)
- ✅ Full exam taking experience with timer, monitoring, auto-save
- ✅ Admin dashboard with analytics, results management, user management
- ✅ Candidate flow: exam list → start → runtime → result
- ✅ Performance optimizations (staleTime, prefetching, memoization)
- ✅ Comprehensive error handling
- ✅ Accessibility features
- ✅ Mobile-responsive design
- ✅ Type-safe throughout
- ✅ Clean architecture with separation of concerns

All features are **fully functional** and **production-ready**.

