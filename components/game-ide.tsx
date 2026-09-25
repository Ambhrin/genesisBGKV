"use client";

import React, { useState, useEffect, useRef } from "react";

export function GameIde() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameHtml, setGameHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<[string, string, string][]>([
    [new Date().toLocaleTimeString(), "info", "Autonomous Claude Game Engine Initialized"],
  ]);
  const [status, setStatus] = useState<"idle" | "generating" | "running" | "healing">("idle");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const addLog = (type: "info" | "success" | "error", message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, [time, type, message]]);
  };

  const handleGenerate = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim()) return;

    setLoading(true);
    setStatus("generating");
    addLog("info", `Claude 3.5 synthesizing: "${targetPrompt}"...`);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");

      setGameHtml(data.gameHtml);
      setStatus("running");
      addLog("success", "Synthesis complete! 60 FPS Canvas engine running.");
    } catch (err: any) {
      setStatus("idle");
      addLog("error", err.message || "Synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  // Autonomous Self-Healing Error Trap
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "GAME_ERROR") {
        const errorMsg = event.data.error;
        addLog("error", `Runtime crash: ${errorMsg}`);
        setStatus("healing");

        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              errorContext: errorMsg,
              previousCode: gameHtml,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setGameHtml(data.gameHtml);
            setStatus("running");
            addLog("success", "Claude healed and patched the game code!");
          }
        } catch {
          addLog("error", "Self-healing failed.");
          setStatus("running");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [gameHtml, prompt]);

  const copyToClipboard = () => {
    if (!gameHtml) return;
    navigator.clipboard.writeText(gameHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wrappedGameHtml = gameHtml
    ? gameHtml.replace(
        "<head>",
        `<head>
        <script>
          window.onerror = function(msg, url, line) {
            window.parent.postMessage({ type: 'GAME_ERROR', error: msg + ' (line ' + line + ')' }, '*');
            return false;
          };
        </script>`
      )
    : "";

  return (
    <div className="flex h-screen w-full flex-col bg-[#07090e] text-slate-200 font-sans">
      {/* Top Navbar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-800/80 px-6 bg-[#0a0d14]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse"></div>
          <span className="font-mono text-lg font-bold tracking-wider text-cyan-400">
            GENESIS <span className="text-xs text-slate-500 font-normal">/ CLAUDE GAME ARCHITECT</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono px-3 py-1 rounded border border-slate-800 bg-slate-900 text-slate-400">
            Engine: <span className="text-cyan-400 font-semibold uppercase">{status}</span>
          </span>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Prompt Studio */}
        <aside className="w-80 border-r border-slate-800/80 bg-[#0a0e17] p-5 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Prompt Game Mechanics
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe ANY game in detail: e.g. 3-lane car chase dodging cops, retro Asteroids splitting space rocks, platformer with double jump..."
                rows={6}
                className="w-full resize-none rounded-lg border border-slate-800 bg-[#06080d] p-3 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Claude Synthesizing Game..." : "⚡ Generate with Claude"}
            </button>
          </div>

          {/* Execution Telemetry Console */}
          <div className="h-48 border-t border-slate-800/80 pt-3 flex flex-col font-mono text-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Telemetry Console</span>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {logs.map(([time, type, message], idx) => (
                <div key={idx} className="flex gap-2">
                  <span suppressHydrationWarning className="text-slate-600">[{time}]</span>
                  <span className={type === "success" ? "text-emerald-400" : type === "error" ? "text-rose-400" : "text-cyan-400"}>
                    {type.toUpperCase()}:
                  </span>
                  <span className="text-slate-300 break-all">{message}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Live Playable Canvas Game */}
        <section className="flex-1 flex flex-col border-r border-slate-800/80 bg-[#07090e] min-w-0">
          <div className="flex h-11 items-center justify-between border-b border-slate-800/80 px-4 bg-[#0a0d14]">
            <span className="text-xs font-mono text-slate-400">🎮 Live Canvas Game Screen</span>
            <span className="text-xs font-mono text-slate-500">700 x 480 @ 60 FPS</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
            {wrappedGameHtml ? (
              <iframe
                ref={iframeRef}
                srcDoc={wrappedGameHtml}
                title="Claude Game Sandbox"
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border border-slate-800/80 rounded-lg shadow-2xl bg-[#080b12]"
              />
            ) : (
              <div className="text-center font-mono text-slate-600">
                <p className="text-base text-slate-400 mb-1">Autonomous Engine Ready</p>
                <p className="text-xs">Type any prompt on the left to synthesize a playable game.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right: Visible Live Generated Code Editor */}
        <section className="w-[450px] flex flex-col bg-[#05070b] flex-shrink-0">
          <div className="flex h-11 items-center justify-between border-b border-slate-800/80 px-4 bg-[#0a0d14]">
            <span className="text-xs font-mono text-cyan-400">💻 Claude Generated Source Code</span>
            {gameHtml && (
              <button
                onClick={copyToClipboard}
                className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed">
            <pre className="whitespace-pre">
              {gameHtml || "// Claude's complete HTML5 + Canvas JavaScript code will stream here..."}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}