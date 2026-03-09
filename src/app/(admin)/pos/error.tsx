'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PosError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="font-display font-extrabold text-ww-text text-xl">
          Quelque chose n&apos;a pas marche
        </h2>
        <p className="ww-label text-sm">
          Une erreur inattendue s&apos;est produite. Veuillez reessayer.
        </p>
        <Button onClick={reset} variant="secondary">
          Reessayer
        </Button>
      </div>
    </div>
  )
}
