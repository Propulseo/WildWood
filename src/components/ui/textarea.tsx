import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-ww-border bg-ww-surface text-ww-text placeholder:text-ww-muted focus-visible:border-ww-orange focus-visible:ring-ww-orange/20 aria-invalid:ring-ww-danger/20 aria-invalid:border-ww-danger flex field-sizing-content min-h-16 w-full rounded-lg border px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
