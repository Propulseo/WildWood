'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { WebcamModal } from './WebcamModal'
import { FacturePreview } from './FacturePreview'

const MAX_SIZE = 5 * 1024 * 1024 // 5 Mo

interface CaptureFactureProps {
  value: string | null
  fileName?: string
  onChange: (base64: string | null, fileName?: string) => void
}

export function CaptureFacture({ value, fileName, onChange }: CaptureFactureProps) {
  const [webcamOpen, setWebcamOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isPdf = fileName?.toLowerCase().endsWith('.pdf') ?? false

  const handleFile = useCallback((file: File) => {
    if (file.size > MAX_SIZE) {
      toast.error('Fichier trop volumineux (max 5 Mo)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string, file.name)
    }
    reader.readAsDataURL(file)
  }, [onChange])

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    onChange(null, undefined)
  }

  function handleReplace() {
    onChange(null, undefined)
  }

  // If there's already a capture, show preview
  if (value) {
    return (
      <FacturePreview
        src={value}
        fileName={fileName}
        isPdf={isPdf}
        onReplace={handleReplace}
        onRemove={handleRemove}
      />
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Two buttons: webcam + file */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setWebcamOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-ww-orange text-white font-display font-bold text-sm uppercase tracking-wide hover:brightness-110 transition-all active:scale-[0.97]"
          >
            <Camera className="h-4 w-4" />
            Webcam
          </button>
          <button
            type="button"
            onClick={openFilePicker}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-ww-surface-2 border border-ww-border text-ww-text font-display font-bold text-sm uppercase tracking-wide hover:border-ww-orange transition-all active:scale-[0.97]"
          >
            <FolderOpen className="h-4 w-4" />
            Fichier
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={openFilePicker}
          className={`flex flex-col items-center justify-center gap-1 py-5 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? 'border-ww-orange bg-[rgba(201,78,10,0.15)]'
              : 'border-ww-border hover:border-ww-muted'
          }`}
        >
          <p className="text-sm font-body text-ww-muted">
            Glissez votre fichier ici
          </p>
          <p className="text-xs font-body text-ww-muted/60">
            JPG · PNG · PDF · max 5Mo
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      <WebcamModal
        open={webcamOpen}
        onClose={() => setWebcamOpen(false)}
        onCapture={(base64) => {
          onChange(base64, 'webcam-capture.jpg')
          setWebcamOpen(false)
        }}
        onFallbackFile={() => {
          setWebcamOpen(false)
          openFilePicker()
        }}
      />
    </>
  )
}
