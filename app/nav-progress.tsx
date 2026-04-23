'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function NavProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    function start() {
      if (tickRef.current) return
      if (hideRef.current) clearTimeout(hideRef.current)
      setVisible(true)
      setProgress(12)
      tickRef.current = setInterval(() => {
        setProgress((p) => (p < 88 ? p + (90 - p) * 0.08 : p))
      }, 180)
    }

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a')
      if (!anchor) return
      if (e.defaultPrevented) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (anchor.target && anchor.target !== '_self') return
      const href = anchor.getAttribute('href')
      if (!href) return
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && url.search === window.location.search) return
      } catch {
        return
      }
      start()
    }

    function handleStartEvent() {
      start()
    }

    document.addEventListener('click', handleClick, { capture: true })
    window.addEventListener('nav-progress:start', handleStartEvent)
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
      window.removeEventListener('nav-progress:start', handleStartEvent)
    }
  }, [])

  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
    setProgress(100)
    hideRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 280)
  }, [pathname])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--accent-green)',
          opacity: visible ? 1 : 0,
          transition: 'width 220ms ease, opacity 240ms ease',
          boxShadow: '0 0 10px var(--accent-green), 0 0 18px rgba(44,255,5,0.45)',
        }}
      />
    </div>
  )
}
