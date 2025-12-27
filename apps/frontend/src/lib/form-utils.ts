/**
 * Form utilities for react-hook-form with Zod
 * 
 * @example
 * import { useForm } from 'react-hook-form'
 * import { zodResolver } from '@hookform/resolvers/zod'
 * import { z } from 'zod'
 * 
 * const schema = z.object({ name: z.string().min(1) })
 * const form = useForm({
 *   resolver: zodResolver(schema),
 *   mode: 'onChange',
 * })
 */

// Re-export zodResolver for convenience
export { zodResolver } from '@hookform/resolvers/zod'

