'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronRight,
  Code2,
  Copy,
  Gamepad2,
  LoaderCircle,
  Play,
  Sparkles,
  Terminal,
  WandSparkles,
} from 'lucide-react'

const starterPrompts = [
  { label: 'Arcade racer', prompt: 'A polished top-down arcade racer with traffic, boost pads, and lap timing.' },
  { label: 'Space defense', prompt: 'A focused space defense game with waves of asteroids, upgrades, and a high score.' },
  { label: 'Platformer', prompt: 'A compact platformer with double jump, moving platforms, collectibles, and a finish flag.' },
]

type LogEntry = [string, string, string]

export function GameIde() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [gameHtml, setGameHtml] = useState('')
  const [copied, setCopied] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([
    ['--:--:--', 'info', 'Genesis workspace ready'],
  ])
  const [status, setStatus] = useState<'idle' | 'generating' | 'running' | 'healing'>('idle')
  const [hydrated, setHydrated] = useState(false)
  const [isPreviewFocused, setIsPreviewFocused] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    // Timestamps are created only in response to client-side activity, never during render.
    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date())
    setLogs((prev) => [...prev, [time, type, message]])
  }

  const handleGenerate = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt
    if (!targetPrompt.trim()) return
    setPrompt(targetPrompt)
    setLoading(true)
    setStatus('generating')
    addLog('info', `Building a playable prototype from your brief...`)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetPrompt }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Generation failed')
      setGameHtml(data.gameHtml)
      setStatus('running')
      addLog('success', 'Prototype is live in the preview panel.')
    } catch (err: any) {
      setStatus('idle')
      addLog('error', err.message || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type !== 'GAME_ERROR') return
      const errorMsg = event.data.error
      addLog('error', `Preview error: ${errorMsg}`)
      setStatus('healing')
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, errorContext: errorMsg, previousCode: gameHtml }),
        })
        const data = await res.json()
        if (data.success) {
          setGameHtml(data.gameHtml)
          setStatus('running')
          addLog('success', 'Preview recovered and is running again.')
        }
      } catch {
        addLog('error', 'Automatic recovery could not complete.')
        setStatus('running')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [gameHtml, prompt])

  const copyToClipboard = () => {
    if (!gameHtml) return
    navigator.clipboard.writeText(gameHtml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wrappedGameHtml = gameHtml
    ? gameHtml.replace(
        '<head>',
        `<head><script>window.onerror=function(msg,url,line){window.parent.postMessage({type:'GAME_ERROR',error:msg+' (line '+line+')'},'*');return false}</script>`,
      )
    : ''

  const statusLabel = status === 'generating' ? 'Building' : status === 'healing' ? 'Recovering' : status === 'running' ? 'Live' : 'Ready'
  const statusTone = status === 'running' ? 'bg-emerald-500' : status === 'idle' ? 'bg-slate-500' : 'bg-amber-500'

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#111417] text-[#e7e9e9] font-sans selection:bg-[#8ab8ad]/30">
      <header className="flex min-h-16 items-center justify-between border-b border-white/[0.08] bg-[#15191c] px-5 lg:px-7">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg border border-[#789f97]/30 bg-[#1d2b2b] text-[#9fc8bd]"><Gamepad2 size={17} /></div>
          <div>
            <div className="flex items-center gap-2"><span className="text-sm font-semibold tracking-wide">Genesis</span><span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-[#9ba5a5]">STUDIO</span></div>
            <p className="text-[11px] text-[#7f8989]">Playable prototypes, made simple</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#8d9897]">
          <span className="hidden sm:inline">Canvas runtime</span>
          <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1b2023] px-3 py-1.5"><span className={`size-1.5 rounded-full ${statusTone}`} />{statusLabel}</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto lg:flex-row lg:overflow-hidden">
        <aside className="flex w-full shrink-0 flex-col border-b border-white/[0.08] bg-[#171b1e] p-5 lg:w-[315px] lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex flex-1 flex-col gap-5">
            <div><p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7f8d8b]">Create a game</p><h1 className="text-xl font-semibold tracking-tight text-[#f0f2f1]">Start with an idea</h1><p className="mt-2 text-sm leading-5 text-[#929c9b]">Describe the mechanics and mood. Genesis will turn it into a playable browser prototype.</p></div>
            <div className="flex flex-col gap-2">
              <label htmlFor="game-prompt" className="text-xs font-medium text-[#b5bfbd]">Your brief</label>
              <textarea id="game-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A top-down racer with drifting and boost pads..." rows={6} className="w-full resize-none rounded-lg border border-white/[0.1] bg-[#101416] p-3 text-sm leading-5 text-[#e7e9e9] outline-none transition placeholder:text-[#697473] focus:border-[#789f97] focus:ring-2 focus:ring-[#789f97]/15" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#73807e]">Try a starting point</p>
              {starterPrompts.map((starter) => <button key={starter.label} type="button" onClick={() => setPrompt(starter.prompt)} className="group flex items-center justify-between rounded-md border border-white/[0.07] bg-[#1c2224] px-3 py-2.5 text-left text-xs text-[#b2bcba] transition hover:border-[#789f97]/50 hover:bg-[#202a2b] hover:text-[#e6eeeb]"><span>{starter.label}</span><ChevronRight size={14} className="text-[#687573] transition group-hover:translate-x-0.5 group-hover:text-[#9fc8bd]" /></button>)}
            </div>
            <button type="button" onClick={() => handleGenerate()} disabled={loading || !prompt.trim()} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#9fc8bd] px-4 text-sm font-semibold text-[#13201e] shadow-sm transition hover:bg-[#b4d5cd] disabled:cursor-not-allowed disabled:opacity-45">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <WandSparkles size={16} />}{loading ? 'Building prototype...' : 'Generate prototype'}</button>
          </div>
          <div className="mt-6 border-t border-white/[0.08] pt-4"><div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#7f8d8b]"><Terminal size={13} /> Activity</span><span className="text-[10px] text-[#697473]">LIVE</span></div><div className="flex max-h-32 flex-col gap-2 overflow-y-auto pr-1">{hydrated && logs.slice(-5).map(([time, type, message], idx) => <div key={idx} className="flex gap-2 text-[11px] leading-4"><span className="shrink-0 text-[#667270]">{time}</span><span className={type === 'success' ? 'text-[#8bc1ae]' : type === 'error' ? 'text-[#e39a91]' : 'text-[#aeb9b7]'}>{message}</span></div>)}</div></div>
        </aside>

        <section className={`order-first flex min-h-[455px] min-w-0 flex-1 flex-col bg-[#111517] transition-all lg:order-none lg:min-h-0 ${isPreviewFocused ? 'lg:flex-[1.2]' : ''}`}>
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-4"><div className="flex items-center gap-2 text-xs font-medium text-[#c1c9c7]"><Play size={14} className="text-[#9fc8bd]" /> Live preview <span className="hidden rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#7f8d8b] sm:inline">INTERACTIVE</span></div><div className="flex items-center gap-2"><span className="hidden text-[11px] text-[#707c7a] sm:inline">HTML Canvas · 60 FPS</span>{wrappedGameHtml && <button type="button" onClick={() => setIsPreviewFocused((value) => !value)} className="rounded-md border border-white/[0.1] px-2.5 py-1.5 text-[11px] text-[#aeb9b7] transition hover:bg-white/[0.06] hover:text-white">{isPreviewFocused ? 'Compact' : 'Focus'}</button>}</div></div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-4 lg:p-6">{wrappedGameHtml ? <iframe ref={iframeRef} srcDoc={wrappedGameHtml} title="Generated game preview" sandbox="allow-scripts allow-modals" className="size-full min-h-[390px] rounded-lg border border-white/[0.1] bg-[#0b0e10] shadow-xl" /> : <div className="flex max-w-sm flex-col items-center text-center"><div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-[#1b2223] text-[#8eafa7]"><Sparkles size={22} /></div><h2 className="text-base font-semibold text-[#d9dfdd]">Your preview will appear here</h2><p className="mt-2 text-sm leading-5 text-[#7f8a88]">Choose a starter or write your own brief, then generate a game to see it come to life.</p></div>}</div>
        </section>

        <section className="flex min-h-[280px] w-full shrink-0 flex-col border-t border-white/[0.08] bg-[#0e1214] lg:w-[380px] lg:border-l lg:border-t-0">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-4"><div className="flex items-center gap-2 text-xs font-medium text-[#c1c9c7]"><Code2 size={14} className="text-[#8eaaa3]" /> Generated source</div>{gameHtml && <button type="button" onClick={copyToClipboard} className="flex items-center gap-1.5 rounded-md border border-white/[0.1] px-2.5 py-1.5 text-[11px] text-[#aeb9b7] transition hover:bg-white/[0.06] hover:text-white">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}</button>}</div>
          <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-5 text-[#98a5a2]"><pre className="whitespace-pre-wrap break-words">{gameHtml || '// Generated HTML and Canvas code will appear here.'}</pre></div>
        </section>
      </div>
    </main>
  )
}
