'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import styles from './page.module.css'

type Step = 'idle' | 'uploading' | 'processing' | 'error'

export default function HomePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // ── File selection ──────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file (JPG, PNG, WEBP).')
      return
    }
    setErrorMessage('')
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !photoFile) return

    setStep('uploading')
    setErrorMessage('')

    try {
      // Compress the image client-side before upload (saves bandwidth + Railway storage)
      const compressed = await imageCompression(photoFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        onProgress: () => {},
      })

      setStep('processing')

      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('photo', compressed, compressed.name)

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate your DP.')
      }

      router.push(`/result/${data.id}`)
    } catch (err: unknown) {
      setStep('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
    }
  }

  const isLoading = step === 'uploading' || step === 'processing'
  const canSubmit = name.trim().length > 0 && photoFile !== null && !isLoading

  return (
    <main className={styles.main}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <div className={styles.logoDot} />
            <span>UNILAG Energy Club</span>
          </div>
          <span className={styles.campaignTag}>Energy Transition 360°</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>#JoinTheTransition</p>
        <h1 className={styles.headline}>
          Get your<br />
          <em>Energy Transition</em><br />
          DP
        </h1>
        <p className={styles.subline}>
          Upload your photo, enter your name — we&apos;ll compose your
          personalized campaign frame in seconds.
        </p>
      </section>

      {/* ── Form card ── */}
      <section className={styles.formSection}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>

          {/* Photo upload */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="photo-input">
              Your photo
            </label>
            <div
              className={[
                styles.dropZone,
                isDragging ? styles.dropZoneDragging : '',
                previewUrl ? styles.dropZoneHasPhoto : '',
              ].join(' ')}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              aria-label="Upload your photo"
            >
              {previewUrl ? (
                <div className={styles.previewWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Your selected photo"
                    className={styles.previewImg}
                  />
                  <div className={styles.previewOverlay}>
                    <span>Change photo</span>
                  </div>
                </div>
              ) : (
                <div className={styles.dropZoneContent}>
                  <div className={styles.uploadIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className={styles.dropZoneLabel}>
                    Tap to upload or drag a photo here
                  </p>
                  <p className={styles.dropZoneHint}>JPG, PNG or WEBP · max 10 MB</p>
                </div>
              )}
            </div>
            <input
              id="photo-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleFileInputChange}
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>

          {/* Name input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name-input">
              Your name
            </label>
            <input
              id="name-input"
              type="text"
              className={styles.textInput}
              placeholder="e.g. Chisom Okonkwo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
              disabled={isLoading}
            />
            <span className={styles.charCount}>{name.length} / 40</span>
          </div>

          {/* Error */}
          {errorMessage && (
            <p className={styles.errorMsg} role="alert">
              {errorMessage}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!canSubmit}
          >
            {step === 'uploading' && <Spinner />}
            {step === 'processing' && <Spinner />}
            {step === 'uploading' && 'Uploading…'}
            {step === 'processing' && 'Composing your DP…'}
            {(step === 'idle' || step === 'error') && 'Generate my DP →'}
          </button>
        </form>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} UNILAG Energy Club · All rights reserved</p>
      </footer>
    </main>
  )
}

function Spinner() {
  return (
    <svg
      className={styles.spinner}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
