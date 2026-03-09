'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminError({
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
    <div className="flex items-center justify-center h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="font-display font-extrabold text-ww-text text-xl">
            Quelque chose n&apos;a pas marche
          </h2>
          <p className="ww-label text-sm">
            Une erreur inattendue s&apos;est produite. Veuillez reessayer.
          </p>
          <Button onClick={reset}>
            Reessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
