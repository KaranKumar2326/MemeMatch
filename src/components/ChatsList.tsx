import React from "react";
import { ChatThread } from "../types";
import { MessageSquare, Calendar, Smile } from "lucide-react";

interface ChatsListProps {
  threads: ChatThread[];
  onSelectThread: (thread: ChatThread) => void;
}

export default function ChatsList({ threads, onSelectThread }: ChatsListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 text-center text-slate-950 font-sans h-full">
        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-2xl shadow-inner animate-pulse">
          💌
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          No Conversations Yet!
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-xs px-2 font-medium">
          Matches will start popping up here when you swipe Right on candidates with similar humor profiles. Keep matching!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-sans text-slate-950">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Humor connections ({threads.length})
        </h3>
        <span className="text-[10px] font-bold text-slate-400">Matches</span>
      </div>

      <div className="flex flex-col gap-2">
        {threads.map((thread) => {
          const lastMsg = thread.messages[thread.messages.length - 1];
          const hasUnread = false; // Mock state

          return (
            <button
              key={thread.candidateId}
              onClick={() => onSelectThread(thread)}
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl border border-slate-50 hover:border-slate-100 bg-white hover:bg-slate-50/50 shadow-sm transition-all text-left cursor-pointer outline-none focus:border-rose-100"
              id={`select_thread_${thread.candidateId}`}
            >
              {/* Avatar circle */}
              <div className={`w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-2xl shadow-inner shrink-0 ${thread.candidateAvatarBg}`}>
                {thread.candidateAvatarEmoji}
              </div>

              {/* Message outline details */}
              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight">{thread.candidateName}</span>
                  <span className="text-[9.5px] font-semibold text-slate-400 font-mono">{lastMsg ? lastMsg.timestamp : ""}</span>
                </div>
                
                {/* Witty subtitle */}
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 tracking-wide uppercase">
                  <Smile className="w-3 h-3 text-rose-500" />
                  <span>{thread.candidateCompatibleTitle}</span>
                </div>

                {/* Last message content */}
                <p className="text-xs text-slate-500 truncate font-medium mt-1 pr-2">
                  {lastMsg ? (
                    lastMsg.sender === "user" ? `You: ${lastMsg.text}` : lastMsg.text
                  ) : (
                    "Tap to start the meme debate..."
                  )}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
