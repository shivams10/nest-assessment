import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/form-utils'
import { useLogin } from '@/hooks/queries/useAuth'
import { TEXT } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginFormValues } from './schemas/login.schema'

/**
 * Login Page Component
 *
 * Features:
 * - Responsive design with mobile-first approach
 * - Accessible form with proper ARIA labels
 * - Client-side validation using Zod
 * - React Hook Form for optimal performance
 * - Theme token-based styling
 * - Production-ready error handling
 * - API integration with error handling
 * - Token storage in Redux and localStorage
 *
 * @returns {JSX.Element} Login page component
 */
export default function LoginPage() {
  // Destructure text constants for cleaner code
  const { APP_NAME, LOGIN, ERRORS } = TEXT
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Destructure form methods and state for cleaner access
  const { handleSubmit, control, setError, clearErrors, reset, formState } = form
  const { errors } = formState
  const { root: rootError, email: emailError, password: passwordError } = errors

  const loginMutation = useLogin()

  const onSubmit = async (data: LoginFormValues) => {
    // Clear any previous root errors
    clearErrors('root')
    
    // Trigger login mutation
    loginMutation.mutate(data, {
      onSuccess: () => {
        // Clear form on success
        reset()
      },
      onError: (error: Error) => {
        // Set form error for user feedback
        setError('root', {
          type: 'manual',
          message: error.message || ERRORS.LOGIN_FAILED,
        })
      },
    })
  }

  const isSubmitting = loginMutation.isPending

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth when ready
    console.log('Google sign in clicked')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 overflow-x-hidden">
      <Card className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row overflow-hidden">
          {/* Google Login Section - Left */}
          <div className="flex flex-1 flex-col items-center justify-center border-b border-border p-4 sm:p-6 md:border-b-0 md:border-r min-w-0">
            <div className="w-full max-w-xs space-y-4 sm:space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-foreground">{APP_NAME}</h2>
                <p className="text-sm text-muted-foreground">{LOGIN.TITLE}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-card hover:bg-accent border-border"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                aria-label={LOGIN.GOOGLE_SIGN_IN_ARIA}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-2.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-1.6 3.32-2.53 6.16-2.53z"
                    fill="#EA4335"
                  />
                </svg>
                {LOGIN.GOOGLE_SIGN_IN}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center px-6 py-4 md:flex-col md:px-4">
            <span className="text-sm text-muted-foreground">{LOGIN.DIVIDER}</span>
          </div>

          {/* System Login Section - Right */}
          <div className="flex flex-1 flex-col p-4 sm:p-6 min-w-0">
            <div className="w-full max-w-xs mx-auto space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{LOGIN.SYSTEM_LOGIN_TITLE}</h2>
              </div>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {/* Root error message - shows API errors */}
                  {rootError && (
                    <div
                      className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {rootError.message}
                    </div>
                  )}

                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">{LOGIN.EMAIL_LABEL}</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder={LOGIN.EMAIL_PLACEHOLDER}
                            autoComplete="email"
                            aria-label={LOGIN.EMAIL_LABEL}
                            aria-describedby={emailError ? 'email-error' : 'email-description'}
                            aria-invalid={!!emailError}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage id="email-error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password">{LOGIN.PASSWORD_LABEL}</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder={LOGIN.PASSWORD_PLACEHOLDER}
                            autoComplete="current-password"
                            aria-label={LOGIN.PASSWORD_LABEL}
                            aria-describedby={
                              passwordError ? 'password-error' : 'password-description'
                            }
                            aria-invalid={!!passwordError}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage id="password-error" />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      aria-label={LOGIN.SIGN_IN_ARIA}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? LOGIN.SIGNING_IN : LOGIN.SIGN_IN_BUTTON}
                    </Button>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline text-center"
                      aria-label={LOGIN.FORGOT_PASSWORD_ARIA}
                    >
                      {LOGIN.FORGOT_PASSWORD}
                    </a>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
