import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-ww-orange/15 text-ww-orange border-ww-orange/30 [a&]:hover:bg-ww-orange/25",
        secondary:
          "bg-ww-surface-2 text-ww-text border-ww-border [a&]:hover:bg-ww-surface-2/80",
        destructive:
          "bg-ww-danger/15 text-ww-danger border-ww-danger/30 [a&]:hover:bg-ww-danger/25",
        outline:
          "border-ww-border text-ww-text [a&]:hover:bg-ww-surface-2",
        ghost: "[a&]:hover:bg-ww-surface-2 [a&]:hover:text-ww-text",
        link: "text-ww-orange underline-offset-4 [a&]:hover:underline",
        lime: "bg-ww-lime/15 text-ww-lime border-ww-lime/30 [a&]:hover:bg-ww-lime/25",
        wood: "bg-ww-wood/15 text-ww-wood border-ww-wood/30 [a&]:hover:bg-ww-wood/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
