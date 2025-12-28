import * as React from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

export interface FormFieldInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  description?: string
  disabled?: boolean
  autoComplete?: string
  'aria-label'?: string
}

/**
 * Reusable form field component that combines FormField, FormItem, FormLabel, FormControl, and FormMessage
 * This provides a consistent structure for all form inputs with proper accessibility and error handling
 *
 * @example
 * ```tsx
 * <FormFieldInput
 *   control={form.control}
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 *   autoComplete="email"
 * />
 * ```
 */
export function FormFieldInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  description,
  disabled,
  autoComplete,
  'aria-label': ariaLabel,
}: FormFieldInputProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              aria-label={ariaLabel || label}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

