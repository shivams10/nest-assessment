import { cn } from '@/lib/utils'

interface OptionItemProps {
  optionId: string
  optionText: string
  isSelected: boolean
  onChange: () => void
  disabled?: boolean
  type: 'single_select' | 'multi_select'
}

/**
 * OptionItem - Individual option for a question
 * Supports both radio (single_select) and checkbox (multi_select)
 * Fully keyboard accessible
 */
export function OptionItem({
  optionText,
  isSelected,
  onChange,
  disabled = false,
  type,
}: OptionItemProps) {
  const inputType = type === 'single_select' ? 'radio' : 'checkbox'

  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:bg-accent',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <input
        type={inputType}
        checked={isSelected}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        aria-label={optionText}
      />
      <span className="flex-1 text-sm text-foreground">{optionText}</span>
    </label>
  )
}

