# Constants Pattern

This directory contains all application constants. **Always use constants instead of hardcoding values.**

## Structure

- `routes.ts` - All route paths
- `storage.ts` - All localStorage/sessionStorage keys
- `text.ts` - All user-facing text strings
- `index.ts` - Central export for all constants

## Usage

```typescript
// ✅ Good - Use constants
import { ROUTES, STORAGE_KEYS, TEXT } from '@/constants'

const path = ROUTES.LOGIN
const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
const message = TEXT.PLACEHOLDERS.LOGIN_PAGE

// ❌ Bad - Don't hardcode
const path = '/login'
const token = localStorage.getItem('auth_token')
const message = 'Login Page (Coming Soon)'
```

## Adding New Constants

1. **Routes**: Add to `routes.ts`
   ```typescript
   export const ROUTES = {
     NEW_ROUTE: '/new-route',
   } as const
   ```

2. **Storage Keys**: Add to `storage.ts`
   ```typescript
   export const STORAGE_KEYS = {
     NEW_KEY: 'new_key',
   } as const
   ```

3. **Text**: Add to `text.ts`
   ```typescript
   export const TEXT = {
     NEW_SECTION: {
       NEW_TEXT: 'New text here',
     },
   } as const
   ```

## Benefits

- ✅ Single source of truth
- ✅ Type safety with `as const`
- ✅ Easy to maintain and update
- ✅ Prevents typos and inconsistencies
- ✅ Ready for internationalization

## Remember

**For future development:**
- Never hardcode routes, storage keys, or text
- Always check if a constant exists before creating new ones
- Add new constants to the appropriate file
- Use the central export from `@/constants`

