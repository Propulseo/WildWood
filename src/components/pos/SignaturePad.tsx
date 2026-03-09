'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface SignaturePadProps {
  onSignature: (base64: string) => void
  onClear: () => void
  width?: number
  height?: number
}

export function SignaturePad({ onSignature, onClear, width = 400, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.strokeStyle = '#1A1108'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    return ctx
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width * 2
    canvas.height = height * 2
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(2, 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
    }
  }, [width, height])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setDrawing(true)
    const pos = getPos(e)
    lastPoint.current = pos
    const ctx = getCtx()
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }, [getPos, getCtx])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    e.preventDefault()
    const ctx = getCtx()
    if (!ctx || !lastPoint.current) return
    const pos = getPos(e)
    const mid = {
      x: (lastPoint.current.x + pos.x) / 2,
      y: (lastPoint.current.y + pos.y) / 2,
    }
    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, mid.x, mid.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(mid.x, mid.y)
    lastPoint.current = pos
    setHasStrokes(true)
  }, [drawing, getPos, getCtx])

  const endDraw = useCallback(() => {
    if (!drawing) return
    setDrawing(false)
    lastPoint.current = null
    const canvas = canvasRef.current
    if (canvas && hasStrokes) {
      onSignature(canvas.toDataURL('image/png'))
    }
  }, [drawing, hasStrokes, onSignature])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
    }
    setHasStrokes(false)
    lastPoint.current = null
    onClear()
  }, [width, height, onClear])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative rounded-lg border-2 border-dashed border-ww-border overflow-hidden" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          className="touch-none cursor-crosshair"
          style={{ width, height }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-ww-muted/40 text-sm font-body">Signez ici</span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-1.5 text-xs font-display font-bold text-ww-muted border border-ww-border rounded-lg hover:text-ww-text transition-colors"
        >
          EFFACER
        </button>
        {hasStrokes && (
          <span className="px-3 py-1.5 text-xs font-body text-ww-success">Signature OK</span>
        )}
      </div>
    </div>
  )
}
