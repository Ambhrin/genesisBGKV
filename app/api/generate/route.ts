import { NextResponse } from "next/server";

export const maxDuration = 180;

const GROQ_KEY = process.env.GROQ_API_KEY || "";
export async function POST(req: Request) {
  try {
    const { prompt, errorContext, previousCode } = await req.json();
    const isSelfHealing = Boolean(errorContext && previousCode);

    const systemPrompt = `You are an elite HTML5 Canvas 2D game architect.
Given the user prompt, write a COMPLETE, custom, single-file HTML5 Canvas browser game.

RULES:
1. Return ONLY pure executable HTML starting directly with <!doctype html> and ending with </html>.
2. Absolutely NO markdown backticks (no \`\`\`html or \`\`\`), no introductory or explanatory text.
3. The HTML MUST contain:
   <canvas id="gameCanvas" width="700" height="480"></canvas>
4. Style:
   * { margin:0; padding:0; box-sizing:border-box; user-select:none; }
   body { background:#07090e; overflow:hidden; font-family:monospace; display:flex; justify-content:center; align-items:center; height:100vh; }
   #gameCanvas { background:#0c101d; border:2px solid #38bdf8; box-shadow:0 0 30px rgba(56,189,248,0.25); border-radius:10px; cursor:crosshair; }
5. Engine Specifications:
   - Call window.focus() on start.
   - Run 60 FPS requestAnimationFrame(loop) loop.
   - Clear canvas every frame: ctx.fillStyle = '#0c101d'; ctx.fillRect(0, 0, 700, 480);
   - Implement the EXACT gameplay, mechanics, controls, and scoring requested.
   - Draw all scores and HUD directly on the canvas using ctx.fillText().
   - Restart logic on Spacebar or click.
   - Finish the entire script cleanly. Never stop halfway.`;

    const userMessage = isSelfHealing
      ? `FIX THIS RUNTIME ERROR:\n${errorContext}\n\nBROKEN SCRIPT:\n${previousCode}\n\nReturn complete working standalone HTML.`
      : `Build this game in HTML5 Canvas: "${prompt}". Implement distinct mechanics, physics, and gameplay specifically matching this request.`;

    // 1. Discover verified CHAT models only (ignoring audio/TTS/classifier models)
    let selectedModel = "";
    try {
      const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${GROQ_KEY}` },
      });
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        const available: string[] = (modelsData.data || [])
          .map((m: any) => m.id as string)
          .filter(
            (id: string) =>
              !id.includes("whisper") &&
              !id.includes("orpheus") &&
              !id.includes("guard") &&
              !id.includes("canopy")
          );

        console.log("[GENESIS] Available Chat models on Groq:", available);

        // Pick the best chat model from the verified list
        selectedModel =
          available.find((id) => id.includes("llama-3.3-70b-versatile")) ||
          available.find((id) => id.includes("llama-3.1-8b-instant")) ||
          available.find((id) => id.includes("gpt-oss-120b")) ||
          available.find((id) => id.includes("gpt-oss-20b")) ||
          available.find((id) => id.includes("qwen")) ||
          available.find((id) => id.includes("mixtral")) ||
          available[0];
      }
    } catch (e: any) {
      console.warn("[GENESIS] Model discovery failed:", e.message);
    }

    if (!selectedModel) {
      selectedModel = "llama-3.3-70b-versatile";
    }

    console.log(`[GENESIS] Routing synthesis to: ${selectedModel}`);

    // 2. Query Groq Chat Completions
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.6,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    let rawCode = data.choices?.[0]?.message?.content || "";

    if (rawCode.includes("\\n")) {
      rawCode = rawCode
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"');
    }

    rawCode = rawCode
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const startIdx = rawCode.toLowerCase().indexOf("<!doctype");
    if (startIdx !== -1) {
      rawCode = rawCode.slice(startIdx);
    } else {
      const htmlIdx = rawCode.toLowerCase().indexOf("<html");
      if (htmlIdx !== -1) rawCode = rawCode.slice(htmlIdx);
    }

    const endIdx = rawCode.toLowerCase().lastIndexOf("</html>");
    if (endIdx !== -1) {
      rawCode = rawCode.slice(0, endIdx + 7);
    }

    rawCode = rawCode.trim();

    if (!rawCode.includes("<canvas") || !rawCode.includes("<script")) {
      throw new Error("Engine did not return a valid HTML canvas structure. Please try again.");
    }

    return NextResponse.json({ success: true, gameHtml: rawCode });
  } catch (error: any) {
    console.error("[GENESIS API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Synthesis failed" },
      { status: 500 }
    );
  }
}