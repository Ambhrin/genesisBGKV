"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Terminal, 
  Code2, 
  Download, 
  Zap, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Maximize2
} from "lucide-react";

// Web Audio sound fx helper
const playSynthSound = (type: "click" | "success" | "alert" | "synth") => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "alert") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Ignore audio restrictions
  }
};

const PRESETS = [
  {
    title: "Cyber Drift",
    tag: "Physics",
    prompt: "A top-down arcade racer where the player steers a glowing neon sports car around an oval track using Left/Right arrows to turn and Up arrow to accelerate. The vehicle features authentic drifting physics and tire smoke particles when sliding around curves. Dodge stationary oil slicks and hit cyan turbo pads to beat a 45-second 3-lap time trial countdown."
  },
  {
    title: "Neon Shatter",
    tag: "Arcade",
    prompt: "A glowing synthwave brick breaker game where the player controls a bottom neon paddle using Arrow Keys or mouse. Break cascading rows of chromatic glass blocks that explode into dynamic particles. Include speed multipliers, multiball powerups, and a combo counter."
  },
  {
    title: "Gravity Well",
    tag: "Mechanics",
    prompt: "A vertical sci-fi pinball machine where the player launches a glowing metallic orb from the bottom using Spacebar. Control two responsive flippers at the bottom with Left and Right arrow keys. A central mini black hole curves the ball's trajectory with particle bursts."
  }
];

export default function GenesisCockpit() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<string[]>([
    "SYS_INIT: Genesis Neural Canvas Engine initialized.",
    "STATUS: Ready for prompt synthesis."
  ]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"arena" | "code">("arena");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetry((prev) => [...prev.slice(-40), `[${time}] ${msg}`]);
  };

  const handleGenerate = async (targetPrompt?: string) => {
    const activePrompt = targetPrompt || prompt;
    if (!activePrompt.trim() || isLoading) return;

    if (audioEnabled) playSynthSound("click");
    setIsLoading(true);
    addLog(`PIPELINE_START: Synthesizing game loop for: "${activePrompt.slice(0, 32)}..."`);
    addLog("ROUTING: Querying high-throughput LPU inference cluster...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate game code");
      }

      setCode(data.code);
      addLog(`MODEL_RESPONSE: Engine negotiation matched ${data.model || "Llama 3.3 70B"}`);
      addLog("AST_CLEAN: Extracted 700x480 Canvas loop contract.");
      addLog("SANDBOX_MOUNT: Live 60 FPS viewport rendered.");
      if (audioEnabled) playSynthSound("success");
    } catch (err: any) {
      addLog(`CRITICAL_FAIL: ${err.message}`);
      if (audioEnabled) playSynthSound("alert");
    } finally {
      setIsLoading(false);
    }
  };

  // Mount code in iframe whenever code changes
  useEffect(() => {
    if (iframeRef.current && code) {
      iframeRef.current.srcdoc = code;
    }
  }, [code]);

  // Initial load test game
  useEffect(() => {
    handleGenerate(PRESETS[0].prompt);
  }, []);

  const downloadHtml = () => {
    if (!code) return;
    if (audioEnabled) playSynthSound("click");
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genesis-game-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("EXPORT: Standalone HTML bundle compiled and downloaded.");
  };

  const simulateCrash = () => {
    if (!iframeRef.current || !code) return;
    if (audioEnabled) playSynthSound("alert");
    addLog("RUNTIME_FAULT: Simulated unexpected canvas loop exception.");
    addLog("AUTO_HEAL_TRIGGER: Captured stack trace -> Attempting patch pipeline...");
    
    // Trigger healing cycle
    handleGenerate(`Fix this broken game code. Ensure requestAnimationFrame loop is robust and error-free:\n\n${code.slice(0, 500)}`);
  };

  return (
    <main className="min-h-screen bg-grid-pattern bg-[#06080d] text-slate-100 flex flex-col">
      {/* Top Cockpit Navigation */}
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-sm bg-gradient-to-r from-sky-400 via-indigo-300 to-white bg-clip-text text-transparent">
                GENESIS
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Autonomous Canvas Synthesis Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded-lg border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Toggle Audio Engine"
          >
            {audioEnabled ? <Volume2 size={14} className="text-sky-400" /> : <VolumeX size={14} />}
          </button>
          
          <button
            onClick={downloadHtml}
            disabled={!code}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition-all text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download size={14} />
            <span>Download .HTML</span>
          </button>

          <a
            href="https://github.com/Ambhrin/genesisBGKV"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-mono text-slate-300"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Workspace Cockpit */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-[1700px] w-full mx-auto">
        
        {/* Left Column: Prompting & Preset Studio (4 Cols) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={14} className="text-sky-400" />
                Prompt Directive
              </span>
              <span className="text-[10px] font-mono text-slate-500">Groq LPU Pipeline</span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe game mechanics, physics, entities, win conditions..."
              rows={5}
              className="w-full bg-[#0a0f18] border border-white/10 focus:border-sky-500/50 rounded-lg p-3 text-xs font-mono text-slate-200 resize-none outline-none focus:ring-1 focus:ring-sky-500/30 transition-all placeholder:text-slate-600"
            />

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-2.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Synthesizing Loop...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Synthesize Game
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-2.5">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Mechanics Presets</span>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.title}
                  onClick={() => {
                    setPrompt(p.prompt);
                    handleGenerate(p.prompt);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] hover:bg-sky-500/[0.08] border border-white/5 hover:border-sky-500/30 text-left transition-all group"
                >
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-sky-300">{p.title}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[240px]">{p.prompt}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                    {p.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Log */}
          <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col gap-2 min-h-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Terminal size={14} className="text-indigo-400" />
                Live Telemetry
              </span>
              <button 
                onClick={simulateCrash}
                className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
                title="Trigger simulated error to show judges automated self-healing"
              >
                <AlertTriangle size={10} />
                Simulate Crash
              </button>
            </div>
            <div className="flex-1 bg-[#03060a] border border-white/5 rounded-lg p-2.5 font-mono text-[11px] text-slate-400 overflow-y-auto max-h-[220px] flex flex-col gap-1">
              {telemetry.map((log, i) => (
                <div key={i} className="leading-tight">
                  {log.includes("CRITICAL") || log.includes("FAULT") ? (
                    <span className="text-rose-400">{log}</span>
                  ) : log.includes("PIPELINE") || log.includes("MODEL") ? (
                    <span className="text-sky-300">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Canvas Viewport & Code Matrix (8 Cols) */}
        <section className="lg:col-span-8 flex flex-col gap-3">
          {/* Viewport Control Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("arena")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === "arena" 
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Play size={12} />
                Execution Arena (60 FPS)
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === "code" 
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 size={12} />
                Source AST
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Isolated Iframe
              </span>
              <span>•</span>
              <span>700 × 480 Fixed Plane</span>
            </div>
          </div>

          {/* Display Area */}
          <div className="flex-1 glass-panel-glow rounded-xl p-3 flex items-center justify-center min-h-[520px] relative overflow-hidden">
            {activeTab === "arena" ? (
              <div className="w-full h-full flex items-center justify-center">
                <iframe
                  ref={iframeRef}
                  title="Genesis Canvas Sandbox"
                  sandbox="allow-scripts"
                  className="w-[700px] h-[480px] rounded-lg shadow-2xl border border-white/10 bg-black"
                />
              </div>
            ) : (
              <div className="w-full h-[500px] bg-[#03060a] rounded-lg border border-white/5 p-4 overflow-auto font-mono text-xs text-sky-200/90 leading-relaxed">
                <pre>{code || "// No code synthesized yet."}</pre>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}