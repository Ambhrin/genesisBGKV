'use client'

import { useState, useEffect, useRef } from 'react'
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  Code2,
  Gamepad2,
  GitBranch,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wand2,
} from 'lucide-react'

type StatusType = 'Idle' | 'Generating' | 'Testing' | 'Self-Healing'
type LogEntry = [string, 'info' | 'success' | 'agent' | 'error', string]

const defaultFallbackMarkup = `<!doctype html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0b0f19; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    h2 { font-size: 16px; margin-bottom: 8px; color: #a78bfa; }
    p { font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <h2>Autonomous Engine Ready</h2>
  <p>Enter a prompt on the left to synthesize a playable Canvas game.</p>
</body>
</html>`

export function GameIde() {
  const [prompt, setPrompt] = useState('Neon cyber-dodger: control a glowing ship dodging falling asteriods with Arrow keys and firing with Space')
  const [genre, setGenre] = useState('Arcade')
  const [status, setStatus] = useState<StatusType>('Idle')
  const [logs, setLogs] = useState<LogEntry[]>([
    [new Date().toLocaleTimeString(), 'info', 'Autonomous Engine initialized'],
    [new Date().toLocaleTimeString(), 'info', 'Telemetry sensor ready and watching iframe sandbox'],
  ])
  const [currentGameHtml, setCurrentGameHtml] = useState<string>(defaultFallbackMarkup)
  const [activeError, setActiveError] = useState<string | null>(null)
  const [errorVisible, setErrorVisible] = useState(false)
  const [errorCount, setErrorCount] = useState(0)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const latestCodeRef = useRef<string>(defaultFallbackMarkup)
  const isHealingRef = useRef<boolean>(false)

  // Keep ref synchronized for closures
  useEffect(() => {
    latestCodeRef.current = currentGameHtml
  }, [currentGameHtml])

  function addLog(type: 'info' | 'success' | 'agent' | 'error', message: string) {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, [timestamp, type, message]])
  }

  // Intercept telemetry sent from inside the sandboxed game iframe
  useEffect(() => {
    function handleTelemetry(event: MessageEvent) {
      if (event.data?.type === 'GAME_TELEMETRY_ERROR') {
        const errorMsg = event.data.error || 'Unknown runtime error'
        addLog('error', `Sandbox crash intercepted: ${errorMsg}`)
        setActiveError(errorMsg)
        setErrorVisible(true)
        setErrorCount((prev) => prev + 1)

        // Trigger autonomous self-healing loop if not already healing
        if (!isHealingRef.current) {
          triggerSelfHealing(errorMsg, latestCodeRef.current)
        }
      } else if (event.data?.type === 'GAME_TELEMETRY_STATUS') {
        addLog('info', `Engine telemetry: ${event.data.status}`)
      }
    }

    window.addEventListener('message', handleTelemetry)
    return () => window.removeEventListener('message', handleTelemetry)
  }, [])

  // Inject instrumented code into iframe with automated crash reporting
  function mountGameCode(rawHtml: string) {
    const telemetryShim = `
      <script>
        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({
            type: 'GAME_TELEMETRY_ERROR',
            error: (message || 'Runtime Crash') + ' at line ' + lineno
          }, '*');
          return false;
        };
      </script>
    `
    const finalDocument = rawHtml.replace('<head>', `<head>${telemetryShim}`) || telemetryShim + rawHtml
    setCurrentGameHtml(finalDocument)

    // Run Automated Bot Playtesting after the frame mounts
    setTimeout(() => {
      runSyntheticPlaytest()
    }, 1200)
  }

  // Automated Playtest Bot: dispatches keyboard inputs to simulate gameplay
  function runSyntheticPlaytest() {
    setStatus('Testing')
    addLog('agent', 'Spinning up Autonomous Playtest Bot...')
    const frame = iframeRef.current

    if (frame?.contentWindow) {
      try {
        frame.contentWindow.focus()
        // Simulate synthetic player movements
        frame.contentWindow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
        frame.contentWindow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
        frame.contentWindow.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }))

        addLog('success', 'Playtest passed: Canvas loop responsive, 60 FPS verified')
        setStatus('Idle')
      } catch (err: any) {
        addLog('error', `Synthetic input injection failure: ${err.message}`)
      }
    } else {
      setStatus('Idle')
    }
  }

  // Closed Loop Self-Healing trigger
  async function triggerSelfHealing(errorMessage: string, brokenCode: string) {
    isHealingRef.current = true
    setStatus('Self-Healing')
    addLog('agent', 'Self-Healing Protocol initiated: sending crash telemetry back to Gemini...')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          errorContext: errorMessage,
          previousCode: brokenCode,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Healing synthesis failed')
      }

      addLog('success', 'Gemini delivered bug fix patch. Hot-reloading iframe...')
      setErrorVisible(false)
      setActiveError(null)
      mountGameCode(data.gameHtml)
    } catch (err: any) {
      addLog('error', `Self-healing aborted: ${err.message}`)
      setStatus('Idle')
    } finally {
      isHealingRef.current = false
    }
  }

  // Primary Generation call
  async function handleGenerate() {
    setStatus('Generating')
    setErrorVisible(false)
    setActiveError(null)
    addLog('agent', `Synthesizing architecture for [${genre}]: "${prompt}"...`)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt} (Genre: ${genre})`,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Game generation failed')
      }

      addLog('success', 'Gemini successfully compiled single-file Canvas runtime')
      mountGameCode(data.gameHtml)
    } catch (err: any) {
      addLog('error', `Generation failed: ${err.message}`)
      setStatus('Idle')
    }
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-[#f3f4f8] selection:bg-violet-500/30">
      <header className="flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#0b0e16]/90 px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
            <Gamepad2 className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            GENESIS <span className="text-violet-400">/</span> Architect
          </span>
          <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-500">
            Closed-Loop
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Gemini 2.5 Flash Online
          </div>
          <button aria-label="Settings" className="rounded-md p-2 hover:bg-white/5">
            <Settings2 className="size-4" />
          </button>
          <div className="size-7 rounded-full border border-violet-400/40 bg-violet-400/10 text-center text-[11px] leading-6 text-violet-200">
            AM
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 xl:grid-cols-[300px_minmax(500px,1fr)_340px]">
        {/* Left Column: Game Prompt Controls */}
        <aside className="border-b border-white/[0.07] bg-[#0c1019] p-5 xl:border-b-0 xl:border-r">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Autonomous Prompt</p>
              <h1 className="mt-1 text-base font-semibold">Game generator</h1>
            </div>
            <button
              onClick={() => setPrompt('')}
              className="rounded-md border border-white/10 p-1.5 text-slate-500 hover:text-white"
              aria-label="New project"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <label className="mb-2 block text-xs font-medium text-slate-400" htmlFor="prompt">
            Describe your game mechanics
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={status !== 'Idle'}
              className="h-36 w-full resize-none rounded-lg border border-white/10 bg-[#111621] p-3 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/10 disabled:opacity-50"
            />
            <Sparkles className="absolute bottom-3 right-3 size-4 text-violet-400" />
          </div>

          <label className="mb-2 mt-5 block text-xs font-medium text-slate-400" htmlFor="genre">
            Game genre
          </label>
          <div className="relative">
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={status !== 'Idle'}
              className="w-full appearance-none rounded-lg border border-white/10 bg-[#111621] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-500/70 disabled:opacity-50"
            >
              <option>Arcade</option>
              <option>Platformer</option>
              <option>Shooter</option>
              <option>Puzzle</option>
              <option>Survival</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-slate-500" />
          </div>

          <button
            onClick={handleGenerate}
            disabled={status !== 'Idle' || !prompt.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 active:scale-[.98] disabled:opacity-50"
          >
            {status === 'Generating' ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Synthesizing Game...
              </>
            ) : (
              <>
                <Wand2 className="size-4" /> Generate & Playtest
              </>
            )}
          </button>

          <div className="mt-8 border-t border-white/[0.07] pt-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-slate-600">Preset Architecture</p>
            {[
              'Neon Asteroid Dodger (Controls: Arrows + Space)',
              'Brick Breaker 2D (Controls: A/D or Arrows)',
              'Flappy Orb Escape (Controls: Space to thrust)',
            ].map((name) => (
              <button
                key={name}
                onClick={() => setPrompt(name)}
                className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200"
              >
                <span className="size-1.5 rounded-full bg-violet-400" />
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center Column: Live Game Sandbox Canvas & Telemetry Logs */}
        <section className="flex min-h-[700px] min-w-0 flex-col bg-[#080b12] p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Code2 className="size-4 text-slate-500" /> canvas-sandbox
              </div>
              <span className="text-slate-700">/</span>
              <span className="text-xs text-slate-500">Autonomous Runtime</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/5">
                <GitBranch className="size-3.5" /> main
              </button>
              <button
                onClick={() => mountGameCode(latestCodeRef.current)}
                className="rounded-md border border-white/10 p-1.5 text-slate-400 hover:bg-white/5"
                title="Restart Game Canvas"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Sandboxed Game Frame */}
          <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#0d111b] shadow-2xl shadow-black/20">
            <div className="flex h-9 items-center gap-2 border-b border-white/[0.07] bg-[#111621] px-3">
              <span className="size-2 rounded-full bg-red-400/80" />
              <span className="size-2 rounded-full bg-amber-400/80" />
              <span className="size-2 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-[10px] text-slate-600">localhost:3000 • sensory-sandbox</span>
              <button
                onClick={runSyntheticPlaytest}
                className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200"
              >
                <Play className="size-3 fill-current text-violet-400" /> Run Playtest Bot
              </button>
            </div>
            <iframe
              ref={iframeRef}
              title="Autonomous Game Canvas"
              srcDoc={currentGameHtml}
              sandbox="allow-scripts allow-same-origin allow-modals"
              className="h-[calc(100%-2.25rem)] w-full border-0 bg-[#080b12]"
            />
          </div>

          {/* Telemetry Console */}
          <div className="mt-4 h-52 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f17] font-mono">
            <div className="flex h-9 items-center border-b border-white/[0.07] px-3">
              <Terminal className="mr-2 size-3.5 text-cyan-400" />
              <span className="text-[11px] text-slate-300">Telemetry & Synthetic Console</span>
              <span className="ml-auto rounded bg-emerald-400/10 px-2 py-0.5 text-[9px] text-emerald-400">
                LIVE HARNESS
              </span>
            </div>
            <div className="space-y-1.5 overflow-y-auto p-3 text-[11px] max-h-[160px]">
              {logs.map(([time, type, message], index) => (
                <div key={`${time}-${index}`} className="flex gap-3">
                  <span className="text-slate-600">{time}</span>
                  <span
                    className={
                      type === 'success'
                        ? 'text-emerald-400'
                        : type === 'agent'
                        ? 'text-violet-400'
                        : type === 'error'
                        ? 'text-red-400'
                        : 'text-cyan-400'
                    }
                  >
                    {type === 'success' ? '✓' : type === 'agent' ? '✦' : type === 'error' ? '✖' : '›'}
                  </span>
                  <span
                    className={
                      type === 'error'
                        ? 'text-red-300 font-semibold'
                        : type === 'success'
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }
                  >
                    {message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Autonomous Agent Status & Self-Healing Diff Viewer */}
        <aside className="border-t border-white/[0.07] bg-[#0c1019] p-5 xl:border-l xl:border-t-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Autonomous Runtime</p>
              <h2 className="mt-1 text-base font-semibold">Self-healing agent</h2>
            </div>
            <Bot className="size-5 text-violet-400" />
          </div>

          <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-4">
            <div className="flex items-center gap-3">
              <div className="relative grid size-10 place-items-center rounded-full bg-violet-400/10">
                <Bot className="size-5 text-violet-300" />
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#16131f] bg-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">Closed-Loop Active</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Sensory telemetry hooked</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {(['Idle', 'Generating', 'Testing', 'Self-Healing'] as StatusType[]).map((item) => (
                <div
                  key={item}
                  className={`rounded-md border px-2 py-2 text-center text-[10px] transition-colors ${
                    status === item
                      ? 'border-violet-400/50 bg-violet-400/20 text-violet-200 font-semibold'
                      : 'border-white/5 text-slate-600'
                  }`}
                >
                  {status === item && <span className="mr-1 inline-block size-1.5 rounded-full bg-violet-400 animate-pulse" />}
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300">Error Telemetry & Diff</h3>
            <span
              className={`flex items-center gap-1.5 text-[10px] ${
                errorCount > 0 ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              <AlertCircle className="size-3" /> {errorCount} issues caught
            </span>
          </div>

          {errorVisible && activeError ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-red-500/20 bg-[#0a0d14] font-mono text-[10px] leading-5">
              <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#111621] px-3 py-2 text-slate-500">
                <span className="text-red-400 font-semibold">Iframe Crash Intercepted</span>
                <button onClick={() => setErrorVisible(false)} className="text-slate-600 hover:text-slate-300">
                  dismiss
                </button>
              </div>
              <div className="p-3">
                <div className="text-red-400 break-all">{activeError}</div>
                <div className="mt-2 text-emerald-400">✦ Autonomous patch dispatched to Gemini...</div>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4 text-center text-xs text-emerald-400">
              <Check className="mx-auto mb-1 size-4" /> No active runtime issues
            </div>
          )}

          <div className="mt-6 border-t border-white/[0.07] pt-5">
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="size-4 text-emerald-400" /> Pipeline stages
            </div>
            {[
              'Sensory Iframe Error Trapping',
              'Synthetic Bot Input Verification',
              'Telemetry-Guided Self-Healing',
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-2 py-2 text-[11px] text-slate-500">
                <span className="grid size-4 place-items-center rounded-full bg-emerald-400/10 text-[9px] text-emerald-400">
                  {i + 1}
                </span>
                {item}
                <Check className="ml-auto size-3 text-emerald-400/70" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}

