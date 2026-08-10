import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type TagInputProps = {
  value:        string[]
  onChange:     (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?:   string
}

const normalize = (tag: string) => tag.trim().toLowerCase()

export const TagInput = ({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Add a tag and press Enter',
  className,
}: TagInputProps) => {
  const [draft, setDraft] = useState('')

  const matches = useMemo(() => {
    const query = normalize(draft)
    return suggestions
      .filter((tag) => !value.includes(tag))
      .filter((tag) => (query ? tag.includes(query) : true))
      .slice(0, 8)
  }, [draft, suggestions, value])

  const add = (tag: string) => {
    const normalized = normalize(tag)
    if (normalized && !value.includes(normalized)) {
      onChange([...value, normalized])
    }
    setDraft('')
  }

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
      return
    }
    if (e.key === 'Backspace' && !draft && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                className="text-brand hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-border px-3 text-sm text-content-primary placeholder:text-content-muted focus:border-brand focus:outline-none"
      />

      {matches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-content-secondary hover:bg-surface-subtle"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
