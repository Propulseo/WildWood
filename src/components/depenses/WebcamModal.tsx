'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { Camera, RotateCcw, Check, X, Upload } from 'lucide-react'

type Status = 'loading' | 'live' | 'captured' | 'error'

interface WebcamModalProps {
  open: boolean
  onClose: () => void
  onCapture: (base64: string) => void
  onFallbackFile: () => void
}

export function WebcamModal({ open, onClose, onCapture, onFallbackFile }: WebcamModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startStream = useCallback(async () => {
    setStatus('loading')
    setPreviewUrl(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('live')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (open) startStream()
    return () => stopStream()
  }, [open, startStream, stopStream])

  function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPreviewUrl(dataUrl)
    setStatus('captured')
    stopStream()
  }

  function handleRetake() {
    setPreviewUrl(null)
    startStream()
  }

  function handleUse() {
    if (previewUrl) onCapture(previewUrl)
  }

  function handleClose() {
    stopStream()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 bg-ww-bg border-ww-border overflow-hidden">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex items-center justify-between p-4 border-b border-ww-border">
            <h2 className="font-display font-extrabold text-lg text-ww-text tracking-wide uppercase">
              Capturer le recu
            </h2>
            <button onClick={handleClose} className="text-ww-muted hover:text-ww-text transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Camera / preview zone */}
          <div className="relative w-full flex justify-center p-6">
            {status === 'error' ? (
              <ErrorFallback onFallbackFile={() => { handleClose(); onFallbackFile() }} />
            ) : (
              <div className="relative rounded-lg overflow-hidden" style={{ maxWidth: 640, aspectRatio: '4/3' }}>
                {status !== 'captured' && (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg bg-black" />
                )}
                {status === 'captured' && previewUrl && (
                  <img src={previewUrl} alt="Capture" className="w-full h-full object-cover rounded-lg" />
                )}
                {status === 'live' && <CornerOverlay />}
                {status === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="h-8 w-8 border-2 border-ww-orange border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>

          {status === 'live' && (
            <p className="text-sm font-body text-ww-muted -mt-2 mb-4">
              Cadrez le recu dans la zone
            </p>
          )}

          {/* Actions */}
          {status !== 'error' && (
            <div className="w-full flex gap-3 p-4 border-t border-ww-border">
              {status === 'captured' ? (
                <>
                  <Button variant="outline" className="flex-1 h-14" onClick={handleRetake}>
                    <RotateCcw className="mr-2 h-4 w-4" />Reprendre
                  </Button>
                  <Button className="flex-1 h-14" onClick={handleUse}>
                    <Check className="mr-2 h-4 w-4" />Utiliser cette photo
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 h-14" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button className="flex-1 h-14" onClick={handleCapture} disabled={status !== 'live'}>
                    <Camera className="mr-2 h-4 w-4" />Prendre la photo
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}

function CornerOverlay() {
  const cornerClass = 'absolute w-8 h-8 border-ww-orange'
  return (
    <div className="absolute inset-4 pointer-events-none">
      <div className={`${cornerClass} top-0 left-0 border-t-2 border-l-2 rounded-tl`} />
      <div className={`${cornerClass} top-0 right-0 border-t-2 border-r-2 rounded-tr`} />
      <div className={`${cornerClass} bottom-0 left-0 border-b-2 border-l-2 rounded-bl`} />
      <div className={`${cornerClass} bottom-0 right-0 border-b-2 border-r-2 rounded-br`} />
    </div>
  )
}

function ErrorFallback({ onFallbackFile }: { onFallbackFile: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <p className="text-ww-text font-body text-center">
        <span className="text-ww-danger">⚠️</span> Camera non disponible
      </p>
      <p className="text-sm text-ww-muted font-body">Utilisez l&apos;upload de fichier</p>
      <Button onClick={onFallbackFile}>
        <Upload className="mr-2 h-4 w-4" />Utiliser un fichier
      </Button>
    </div>
  )
}
