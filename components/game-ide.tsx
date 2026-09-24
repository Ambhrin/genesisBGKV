'use client'

import { useState } from 'react'
import { AlertCircle, Bot, Check, ChevronDown, Code2, Gamepad2, GitBranch, Loader2, Play, Plus, RotateCcw, Send, Settings2, ShieldCheck, Sparkles, Terminal, Wand2, Zap } from 'lucide-react'

const gameMarkup = `<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;background:#101421;color:#fff;font:14px system-ui;overflow:hidden}main{height:100vh;display:grid;place-items:center;position:relative;background:radial-gradient(circle at 50% 40%,#20345e 0,#11182b 42%,#0b0f19 100%)}.orb{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#8c7bff,#38d9c4);box-shadow:0 0 50px #526cff;animation:pulse 2s infinite}.grid{position:absolute;inset:55% 0 0;background:linear-gradient(transparent 95%,#263355 96%),linear-gradient(90deg,transparent 95%,#263355 96%);background-size:38px 25px;transform:perspective(240px) rotateX(55deg);opacity:.42}@keyframes pulse{50%{transform:scale(1.09);box-shadow:0 0 85px #697cff}}</style></head><body><main><div class='grid'></div><div class='orb'></div></main></body></html>`

const initialLogs = [
  ['10:42:08', 'info', 'Generation request accepted'],
  ['10:42:09', 'info', 'Scaffolding project: neon-drift'],
  ['10:42:11', 'success', 'Compiled 24 modules in 1.8s'],
  ['10:42:11', 'info', 'Starting playtest runner...'],
]

export function GameIde() {
  const [prompt, setPrompt] = useState('A neon hover-bike arena with procedural obstacles and a synthwave soundtrack')
  const [genre, setGenre] = useState('Arcade')
  const [status, setStatus] = useState('Idle')
  const [logs, setLogs] = useState(initialLogs)
  const [errorVisible, setErrorVisible] = useState(true)

  function generate() {
    setStatus('Generating')
    setLogs((current) => [...current, ['10:42:14', 'agent', 'Agent is translating your prompt...']])
    window.setTimeout(() => {
      setStatus('Testing')
      setLogs((current) => [...current, ['10:42:16', 'success', 'Playtest started — 60 FPS']])
    }, 900)
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-[#f3f4f8] selection:bg-violet-500/30">
      <header className="flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#0b0e16]/90 px-6">
        <div className="flex items-center gap-3"><div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20"><Gamepad2 className="size-4 text-white" /></div><span className="text-sm font-semibold tracking-tight">NEXUS <span className="text-violet-400">/</span> Forge</span><span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-500">Beta</span></div>
        <div className="flex items-center gap-4 text-xs text-slate-500"><div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> All systems operational</div><button aria-label="Settings" className="rounded-md p-2 hover:bg-white/5"><Settings2 className="size-4" /></button><div className="size-7 rounded-full border border-violet-400/40 bg-violet-400/10 text-center text-[11px] leading-6 text-violet-200">JD</div></div>
      </header>
      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 xl:grid-cols-[280px_minmax(500px,1fr)_320px]">
        <aside className="border-b border-white/[0.07] bg-[#0c1019] p-5 xl:border-b-0 xl:border-r">
          <div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">New creation</p><h1 className="mt-1 text-base font-semibold">Game generator</h1></div><button className="rounded-md border border-white/10 p-1.5 text-slate-500 hover:text-white" aria-label="New project"><Plus className="size-4" /></button></div>
          <label className="mb-2 block text-xs font-medium text-slate-400" htmlFor="prompt">Describe your game</label><div className="relative"><textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="h-36 w-full resize-none rounded-lg border border-white/10 bg-[#111621] p-3 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/10" /><Sparkles className="absolute bottom-3 right-3 size-4 text-violet-400" /></div>
          <label className="mb-2 mt-5 block text-xs font-medium text-slate-400" htmlFor="genre">Game genre</label><div className="relative"><select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full appearance-none rounded-lg border border-white/10 bg-[#111621] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-500/70"><option>Arcade</option><option>RPG</option><option>Strategy</option><option>Platformer</option><option>Simulation</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-slate-500" /></div>
          <button onClick={generate} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 active:scale-[.98]"><Wand2 className="size-4" /> Generate game</button>
          <div className="mt-8 border-t border-white/[0.07] pt-5"><p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-slate-600">Recent projects</p>{['neon-drift', 'orbital-keeper', 'pixel-pioneer'].map((name, i) => <button key={name} className="mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200"><span className={`size-1.5 rounded-full ${i === 0 ? 'bg-violet-400' : 'bg-slate-700'}`} />{name}<span className="ml-auto text-[10px] text-slate-600">{i === 0 ? 'active' : '2d ago'}</span></button>)}</div>
        </aside>
        <section className="flex min-h-[700px] min-w-0 flex-col bg-[#080b12] p-4 md:p-5"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex items-center gap-2 text-xs text-slate-300"><Code2 className="size-4 text-slate-500" /> neon-drift</div><span className="text-slate-700">/</span><span className="text-xs text-slate-500">Game canvas</span></div><div className="flex items-center gap-2"><button className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/5"><GitBranch className="size-3.5" /> main</button><button className="rounded-md border border-white/10 p-1.5 text-slate-400 hover:bg-white/5" aria-label="Reset canvas"><RotateCcw className="size-3.5" /></button></div></div>
          <div className="relative min-h-[380px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#0d111b] shadow-2xl shadow-black/20"><div className="flex h-9 items-center gap-2 border-b border-white/[0.07] bg-[#111621] px-3"><span className="size-2 rounded-full bg-red-400/80" /><span className="size-2 rounded-full bg-amber-400/80" /><span className="size-2 rounded-full bg-emerald-400/80" /><span className="ml-3 text-[10px] text-slate-600">localhost:3000 • preview</span><button className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300"><Play className="size-3 fill-current" /> Run</button></div><iframe title="Generated game preview" srcDoc={gameMarkup} className="h-[calc(100%-2.25rem)] w-full border-0" /></div>
          <div className="mt-4 h-52 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f17] font-mono"><div className="flex h-9 items-center border-b border-white/[0.07] px-3"><Terminal className="mr-2 size-3.5 text-cyan-400" /><span className="text-[11px] text-slate-300">Telemetry & console</span><span className="ml-auto rounded bg-emerald-400/10 px-2 py-0.5 text-[9px] text-emerald-400">LIVE</span></div><div className="space-y-1.5 overflow-y-auto p-3 text-[11px]">{logs.map(([time, type, message], index) => <div key={`${time}-${index}`} className="flex gap-3"><span className="text-slate-600">{time}</span><span className={type === 'success' ? 'text-emerald-400' : type === 'agent' ? 'text-violet-400' : 'text-cyan-400'}>{type === 'success' ? '✓' : type === 'agent' ? '✦' : '›'}</span><span className="text-slate-400">{message}</span></div>)}</div></div>
        </section>
        <aside className="border-t border-white/[0.07] bg-[#0c1019] p-5 xl:border-l xl:border-t-0"><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Autonomous runtime</p><h2 className="mt-1 text-base font-semibold">Self-healing agent</h2></div><Bot className="size-5 text-violet-400" /></div><div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-4"><div className="flex items-center gap-3"><div className="relative grid size-10 place-items-center rounded-full bg-violet-400/10"><Bot className="size-5 text-violet-300" /><span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#16131f] bg-emerald-400" /></div><div><p className="text-sm font-medium text-slate-100">Agent online</p><p className="mt-0.5 text-[11px] text-slate-500">Watching runtime events</p></div></div><div className="mt-5 grid grid-cols-2 gap-2">{['Idle', 'Generating', 'Testing', 'Self-Healing'].map((item) => <div key={item} className={`rounded-md border px-2 py-2 text-center text-[10px] ${status === item ? 'border-violet-400/50 bg-violet-400/10 text-violet-200' : 'border-white/5 text-slate-600'}`}>{status === item && <span className="mr-1 inline-block size-1.5 rounded-full bg-violet-400" />}{item}</div>)}</div></div>
          <div className="mt-6 flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-300">Error diff viewer</h3><span className="flex items-center gap-1.5 text-[10px] text-amber-400"><AlertCircle className="size-3" /> 1 issue</span></div>{errorVisible ? <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-[#0a0d14] font-mono text-[10px] leading-5"><div className="flex items-center justify-between border-b border-white/[0.07] bg-[#111621] px-3 py-2 text-slate-500"><span>player-controller.ts</span><button onClick={() => setErrorVisible(false)} className="text-slate-600 hover:text-slate-300">dismiss</button></div><div className="p-3"><div className="text-red-400/80">-  const speed = player.velocity.x</div><div className="text-emerald-400/90">+  const speed = player?.velocity?.x ?? 0</div><div className="mt-3 text-slate-500">TypeError: Cannot read properties of undefined</div></div></div> : <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4 text-center text-xs text-emerald-400"><Check className="mx-auto mb-1 size-4" /> No active issues</div>}
          <div className="mt-6 border-t border-white/[0.07] pt-5"><div className="mb-3 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="size-4 text-emerald-400" /> Recovery actions</div>{['Detect runtime errors', 'Patch source automatically', 'Re-run affected tests'].map((item, i) => <div key={item} className="flex items-center gap-2 py-2 text-[11px] text-slate-500"><span className="grid size-4 place-items-center rounded-full bg-emerald-400/10 text-[9px] text-emerald-400">{i + 1}</span>{item}<Check className="ml-auto size-3 text-emerald-400/70" /></div>)}</div>
        </aside>
      </div>
    </main>
  )
}

export function PageFooter() { return null }

void Loader2
void Send
void Zap

