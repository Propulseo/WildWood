import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-ww-text placeholder:text-ww-muted selection:bg-ww-orange/20 selection:text-ww-text border-ww-border bg-ww-surface h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base text-ww-text transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ww-orange focus-visible:ring-ww-orange/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-ww-danger/20 aria-invalid:border-ww-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
