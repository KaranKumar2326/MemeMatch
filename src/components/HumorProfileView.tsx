import React, { useState } from "react";
import { UserHumorPersona, Meme, HumorCategory } from "../types";
import { Smile, Award, Sparkles, TrendingUp, Cpu, Send, CheckCircle2, RefreshCw, Trash2, Heart } from "lucide-react";
import MemeView from "./MemeView";
import { playMessageSound } from "../audioUtils";

interface HumorProfileViewProps {
  persona: UserHumorPersona;
  userName: string;
  customMemes: Meme[];
  onAddCustomMeme: (meme: Meme & { critique?: string }) => void;
  onRemoveCustomMeme: (id: string) => void;
}

export default function HumorProfileView({
  persona,
  userName,
  customMemes,
  onAddCustomMeme,
  onRemoveCustomMeme
}: HumorProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "lab">("specs");
  
  // Custom Meme form states
  const [memeText, setMemeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<any | null>(null);

  // Math for SVG Comedy Radar Chart
  // Center is (90, 90), total radius is 60
  const cx = 90;
  const cy = 90;
  const maxRadius = 55;
  const numClasses = 6;
  
  // Angle for each axis
  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numClasses - Math.PI / 2;
    const radius = (value / 10) * maxRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { x, y };
  };

  // Generate radar polygon points
  const points = persona.scores.map((scoreObj, idx) => {
    const coords = getCoordinates(idx, scoreObj.score);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  // Handle custom meme evaluation via server endpoint
  const handleSubmitMeme = async () => {
    if (!memeText.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    setJustCreated(null);

    try {
      const res = await fetch("/api/analyze-custom-meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memeContent: memeText })
      });

      if (!res.ok) {
        throw new Error("Unable to analyze custom comedy. Try simplifying your text!");
      }

      const rawMeme = await res.json();
      onAddCustomMeme(rawMeme);
      setJustCreated(rawMeme);
      setMemeText("");
      playMessageSound();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Operation timed out. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full bg-slate-50 font-sans text-slate-905">
      
      {/* Dynamic Sub-tab Selector */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex gap-4 shrink-0 z-10 shadow-xs">
        <button
          onClick={() => setActiveTab("specs")}
          className={`pb-2.5 pt-1.5 text-xs font-bold font-mono uppercase border-b-2 transition ${
            activeTab === "specs"
              ? "border-rose-500 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
          id="profile_tab_specs"
        >
          Comedy Specs
        </button>
        <button
          onClick={() => setActiveTab("lab")}
          className={`pb-2.5 pt-1.5 text-xs font-bold font-mono uppercase border-b-2 transition flex items-center gap-1 ${
            activeTab === "lab"
              ? "border-rose-500 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
          id="profile_tab_lab"
        >
          <Cpu className="w-3.5 h-3.5" />
          Meme Lab
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
        {activeTab === "specs" ? (
          <>
            {/* Dynamic Avatar & Header */}
            <div className="flex flex-col items-center text-center mt-2 mb-5 shrink-0">
              <div className={`w-18 h-18 rounded-full border border-slate-200 flex items-center justify-center text-3.5xl shadow ${persona.avatarBg}`}>
                {persona.avatarEmoji}
              </div>
              <h2 className="text-xl font-black tracking-tight mt-2 text-slate-900 leading-tight">
                {persona.title}
              </h2>
              <p className="text-rose-500 font-bold text-[9.5px] uppercase tracking-widest mt-0.5 font-mono">
                {userName}&apos;s Humor Signature
              </p>
              
              <p className="mt-2.5 px-4 text-[11px] italic font-medium text-slate-550 leading-relaxed max-w-sm">
                &ldquo;{persona.tagline}&rdquo;
              </p>
            </div>

            {/* Radar Spider web and text side-by-side */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4 flex items-center gap-4 shrink-0">
              <div className="shrink-0 relative">
                {/* SVG Radar Chart Representation */}
                <svg width="180" height="180" className="mx-auto overflow-visible">
                  {/* Outer Background rings */}
                  <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  <circle cx={cx} cy={cy} r={maxRadius * 0.66} fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
                  <circle cx={cx} cy={cy} r={maxRadius * 0.33} fill="none" stroke="#f1f5f9" strokeWidth="0.8" />

                  {/* Draw Axis spokes */}
                  {persona.scores.map((score, sIdx) => {
                    const outerCoords = getCoordinates(sIdx, 10);
                    return (
                      <g key={`axis-${sIdx}`}>
                        <line
                          x1={cx}
                          y1={cy}
                          x2={outerCoords.x}
                          y2={outerCoords.y}
                          stroke="#e2e8f0"
                          strokeWidth="0.8"
                        />
                        {/* Short axis indicators */}
                        <text
                          x={outerCoords.x + (outerCoords.x > cx ? 5 : outerCoords.x < cx ? -5 : 0)}
                          y={outerCoords.y + (outerCoords.y > cy ? 4 : outerCoords.y < cy ? -4 : 0)}
                          fontSize="9"
                          fontWeight="bold"
                          fill="#94a3b8"
                          textAnchor={outerCoords.x > cx ? "start" : outerCoords.x < cx ? "end" : "middle"}
                        >
                          {score.emoji}
                        </text>
                      </g>
                    );
                  })}

                  {/* Translucent humor geometry polygon */}
                  <polygon
                    points={points}
                    fill="rgba(244, 63, 94, 0.18)"
                    stroke="rgba(244, 63, 94, 0.85)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  
                  {/* Vertices dot plot */}
                  {persona.scores.map((score, sIdx) => {
                    const coords = getCoordinates(sIdx, score.score);
                    return (
                      <circle
                        key={`dot-${sIdx}`}
                        cx={coords.x}
                        cy={coords.y}
                        r="3.5"
                        className="fill-rose-500 stroke-white stroke-2"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Quick description side stats */}
              <div className="flex-1 flex flex-col gap-1 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Vibe Shape
                </span>
                <p className="text-[11px] font-semibold text-slate-600 leading-normal">
                  Your geometry indicates high alignment on <span className="text-slate-800 font-bold capitalize">{persona.bestMatchCategory.replace("_", " ")}</span> humor. 
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] bg-rose-50 px-2 py-1 rounded-lg text-rose-600 font-medium">
                  <Award className="w-3.5 h-3.5" />
                  <span>Verified Original</span>
                </div>
              </div>
            </div>

            {/* Analysis report details */}
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm mb-4 flex flex-col gap-1 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Award className="w-4 h-4 text-rose-500" />
                Dating Vibe Analysis
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {persona.description}
              </p>
            </div>

            {/* Matching advice benchmarks */}
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 font-mono">
                  Prime Match
                </span>
                <span className="text-xs font-bold text-slate-850 capitalize leading-tight">
                  {persona.bestMatchCategory.replace("_", " ")}
                </span>
                <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-medium">
                  Perfect triggers for cozy banter.
                </p>
              </div>

              <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-rose-600 font-mono">
                  Skeptic Mode
                </span>
                <span className="text-xs font-bold text-slate-850 capitalize leading-tight font-sans">
                  {persona.worstMatchCategory.replace("_", " ")}
                </span>
                <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-medium">
                  You are bound to clarify the punchline.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 text-left">
            {/* Custom Submitter card header */}
            <div className="bg-white p-4 rounded-3xl border border-slate-150/45 shadow-sm flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Write a custom meme text
                </span>
                <h3 className="text-base font-black text-slate-850 tracking-tight leading-none mt-0.5">
                  AI Meme Analyser
                </h3>
              </div>

              <textarea
                value={memeText}
                onChange={(e) => {
                  setMemeText(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={isLoading}
                placeholder="e.g. Me looking at 4 different VS Code tabs but none of them contain my written password to humanity..."
                rows={3}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-250/50 rounded-2xl bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 transition"
                id="meme_text_builder_area"
              />

              {errorMsg && (
                <p className="text-[10px] font-bold text-rose-600">
                  {errorMsg}
                </p>
              )}

              <button
                onClick={handleSubmitMeme}
                disabled={!memeText.trim() || isLoading}
                className="w-full bg-rose-550 hover:bg-rose-600 text-white bg-rose-500 py-3 rounded-2xl text-xs font-extrabold shadow flex items-center justify-center gap-1.5 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                id="btn_submit_meme_for_psych"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Baking comedy parameters...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Analyze Meme Compatibility
                  </>
                )}
              </button>
            </div>

            {/* Render newly qualified analysed custom card preview directly */}
            {justCreated && (
              <div className="bg-white p-4.5 rounded-3xl border-2 border-slate-900 border-dashed flex flex-col gap-3">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-1 animate-pulse">
                  <Award className="w-3.5 h-3.5" /> Created Custom Meme Card
                </span>

                <div className="w-48 aspect-[4/5] mx-auto rounded-2xl overflow-hidden shadow">
                  <MemeView meme={justCreated} />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100/80 rounded-2xl">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase text-slate-400">
                    Psychological Diagnosis
                  </span>
                  <p className="text-[11px] font-semibold text-slate-600 leading-relaxed mt-0.5">
                    {justCreated.critique}
                  </p>
                </div>
              </div>
            )}

            {/* List personal submitted custom cards history */}
            <div className="flex flex-col gap-2.5 mt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Your Meme Lab Portfolio ({customMemes.length})
              </span>
              
              {customMemes.length === 0 ? (
                <div className="bg-white/40 border border-dashed text-center p-6 rounded-2xl text-xs text-slate-400 font-semibold italic">
                  No custom meme sheets crafted yet. Draft your first above!
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {customMemes.map((m: any) => (
                    <div key={m.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 relative">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{m.emoji}</span>
                          <span className="text-xs font-bold text-slate-900 truncate">{m.title}</span>
                          <span className="text-[8px] uppercase font-bold tracking-wider text-rose-500 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5">
                            {String(m.category).replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 italic truncate mt-1 leading-snug">&ldquo;{m.content}&rdquo;</p>
                      </div>

                      <button
                        onClick={() => onRemoveCustomMeme(m.id)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 hover:scale-105 active:scale-90 transition shrink-0 cursor-pointer"
                        title="Delete custom meme"
                        id={`delete-m-${m.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
