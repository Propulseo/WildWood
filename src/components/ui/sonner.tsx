"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-ww-lime" />,
        info: <InfoIcon className="size-4 text-ww-orange" />,
        warning: <TriangleAlertIcon className="size-4 text-ww-orange" />,
        error: <OctagonXIcon className="size-4 text-ww-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin text-ww-orange" />,
      }}
      style={
        {
          "--normal-bg": "var(--ww-surface)",
          "--normal-text": "var(--ww-text)",
          "--normal-border": "var(--ww-border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "var(--ww-surface)",
          "--success-text": "var(--ww-text)",
          "--success-border": "var(--ww-lime)",
          "--error-bg": "var(--ww-surface)",
          "--error-text": "var(--ww-text)",
          "--error-border": "var(--ww-danger)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "border-l-4",
          success: "border-l-ww-lime",
          error: "border-l-ww-danger",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
