'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './result.module.css'

interface Props {
  name: string
  dpUrl: string
  recordId: string
}

export default function ResultClient({ name, dpUrl, recordId }: Props) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(dpUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `energy-transition-dp-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in new tab
      window.open(dpUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/result/${recordId}`
    : ''

  const handleShare = async () => {
    const shareData = {
      title: 'I Just Joined The Energy Transition — UNILAG Energy Club',
      text: `I just joined the Energy Transition 360 campaign by UNILAG Energy Club! 🌱⚡ #JoinTheTransition`,
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled share — no-op
      }
    } else {
      // Fallback: copy URL
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <div className={styles.logoDot} />
            <span>UNILAG Energy Club</span>
          </div>
          <span className={styles.campaignTag}>Energy Transition 360°</span>
        </div>
      </header>

      <section className={styles.content}>
        {/* Success badge */}
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>✦</span>
          Your DP is ready
        </div>

        <h1 className={styles.heading}>
          Welcome, <span>{name}</span>!
        </h1>
        <p className={styles.subtext}>
          Your personalized Energy Transition frame is ready. Download it and
          set it as your profile picture across your socials.
        </p>

        {/* DP preview */}
        <div className={styles.dpFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dpUrl}
            alt={`${name}'s Energy Transition DP`}
            className={styles.dpImage}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.downloadBtn}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <DownloadSpinner />
                Downloading…
              </>
            ) : (
              <>
                <DownloadIcon />
                Download DP
              </>
            )}
          </button>

          <button className={styles.shareBtn} onClick={handleShare}>
            {copied ? (
              <>
                <CheckIcon />
                Link copied!
              </>
            ) : (
              <>
                <ShareIcon />
                Share
              </>
            )}
          </button>
        </div>

        {/* Hashtag nudge */}
        <p className={styles.hashtag}>
          Tag us <strong>#JoinTheTransition</strong> when you post 🌱
        </p>

        {/* Make another */}
        <Link href="/" className={styles.makeAnotherLink}>
          ← Make one for a friend
        </Link>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} UNILAG Energy Club · All rights reserved</p>
      </footer>
    </main>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function DownloadSpinner() {
  return (
    <svg className={styles.spinner} width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
