import React from "react";
import { Meme } from "../types";
import { Code, Terminal, MessageSquare, Heart, AlertCircle, Quote } from "lucide-react";

interface MemeViewProps {
  meme: Meme;
  mini?: boolean;
}

export default function MemeView({ meme, mini = false }: MemeViewProps) {
  const renderMemeContent = () => {
    switch (meme.format) {
      case "code":
        return (
          <div className="font-mono text-xs text-left p-3 rounded-lg bg-gray-950 text-emerald-400 border border-gray-800 flex flex-col gap-1 shadow-inner h-full justify-center">
            <div className="flex items-center gap-1.5 border-b border-gray-800 pb-1.5 mb-1.5 text-gray-500 text-[10px]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-1 tracking-tight">App.tsx</span>
            </div>
            {meme.content.split("\n").map((line, i) => (
              <div key={i} className="whitespace-pre">
                <span className="text-gray-600 select-none mr-2">{(i + 1).toString().padStart(2, "0")}</span>
                {line}
              </div>
            ))}
          </div>
        );

      case "conversation":
        return (
          <div className="flex flex-col gap-3.5 my-auto text-sm w-full font-sans">
            {meme.content.split("\n\n").map((chunk, i) => {
              const isUser = chunk.trim().startsWith("Me:") || chunk.trim().startsWith("You:");
              const text = chunk.replace(/^(Me:|You:|AI:|Your dog:|Recipe:)/, "").trim();
              const label = chunk.match(/^(Me:|You:|AI:|Your dog:|Recipe:)/)?.[0] || "";

              return (
                <div
                  key={i}
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    isUser ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label.replace(":", "")}</span>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-left leading-relaxed ${
                      isUser
                        ? "bg-rose-500 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    }`}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "cat":
        return (
          <div className="flex flex-col gap-3 my-auto text-center font-sans">
            <div className="relative inline-block mx-auto">
              <span className="text-6xl filter drop-shadow-md select-none animate-bounce duration-[2500ms]">{meme.emoji}</span>
              <div className="absolute -bottom-1 -right-1 bg-white border border-gray-100 p-1.5 rounded-full shadow-md">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
            </div>
            <p className="font-semibold text-gray-800 text-base leading-snug px-2">
              &ldquo;{meme.content}&rdquo;
            </p>
          </div>
        );

      case "absurd":
        return (
          <div className="flex flex-col justify-center items-center text-center font-mono py-2 text-violet-950 border border-purple-200 border-dashed rounded-lg bg-purple-50/50 p-3 h-full gap-2">
            <Terminal className="w-5 h-5 text-purple-600 animate-pulse" />
            <p className="text-sm font-semibold italic text-purple-950 px-2 line-clamp-4">
              {meme.content}
            </p>
          </div>
        );

      case "existential":
        return (
          <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 p-4 font-sans text-center text-slate-200 flex flex-col justify-center gap-3 shadow-lg h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0,transparent_75%)]" />
            <Quote className="w-6 h-6 text-slate-700 mx-auto" />
            <p className="text-xs tracking-wide leading-relaxed relative z-10 px-1 text-slate-300">
              {meme.content}
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center font-sans text-sm text-gray-800 p-4 border border-gray-100 bg-white rounded-xl shadow-sm leading-relaxed my-auto flex items-center justify-center">
            &ldquo;{meme.content}&rdquo;
          </div>
        );
    }
  };

  if (mini) {
    return (
      <div className={`p-3 rounded-xl border ${meme.themeColor} flex items-center gap-3 shadow-sm hover:scale-[1.01] transition-transform`}>
        <span className="text-2xl p-1.5 bg-white/70 rounded-lg shrink-0 shadow-inner">{meme.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs text-gray-900 truncate">{meme.title}</p>
          <p className="text-[10px] text-gray-500 truncate italic">{meme.content}</p>
        </div>
        <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 bg-white/60 px-2 py-0.5 rounded-full border border-gray-100">
          {meme.category.replace("_", " ")}
        </span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full p-5 rounded-3xl border flex flex-col justify-between shadow-sm relative ${meme.themeColor}`}>
      {/* Category Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5">
          <span className="p-1 px-1.5 rounded-md bg-white text-sm shadow-sm">{meme.emoji}</span>
          <span className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-mono">
            {meme.title}
          </span>
        </div>
        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${meme.textColor} bg-white/60`}>
          {meme.category.replace("_", " ")}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center py-2 shrink-0">
        {renderMemeContent()}
      </div>

      {/* Footer Caption */}
      {meme.bottomCaption && (
        <div className="mt-4 border-t border-gray-200/50 pt-3 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
          <p className="text-[11px] italic font-medium text-gray-600 leading-snug text-left">
            {meme.bottomCaption}
          </p>
        </div>
      )}
    </div>
  );
}
