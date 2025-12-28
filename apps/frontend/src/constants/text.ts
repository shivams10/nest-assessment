/**
 * Text Constants
 * All user-facing text strings should be defined here
 * Use these constants instead of hardcoding text
 * This makes it easier to:
 * - Maintain consistency
 * - Support internationalization in the future
 * - Update text in one place
 */

export const TEXT = {
  // Page placeholders
  PLACEHOLDERS: {
    LOGIN_PAGE: 'Login Page (Coming Soon)',
    HOME_PAGE: 'Home Page (Coming Soon)',
  },

  // Application name
  APP_NAME: 'NEST Assessment',

  // Login page
  LOGIN: {
    TITLE: 'Login',
    SYSTEM_LOGIN_TITLE: 'System Login',
    GOOGLE_SIGN_IN: 'Sign in with Google',
    DIVIDER: 'OR',
    EMAIL_LABEL: 'Email Address',
    EMAIL_PLACEHOLDER: 'Enter your email',
    PASSWORD_LABEL: 'Password',
    PASSWORD_PLACEHOLDER: 'Enter your password',
    SIGN_IN_BUTTON: 'Sign In',
    SIGNING_IN: 'Signing in...',
    FORGOT_PASSWORD: 'Forgot Password?',
    FORGOT_PASSWORD_ARIA: 'Forgot password? Click to reset',
    GOOGLE_SIGN_IN_ARIA: 'Sign in with Google',
    SIGN_IN_ARIA: 'Sign in to your account',
  },

  // Error messages
  ERRORS: {
    LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  },
} as const

