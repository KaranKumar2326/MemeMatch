import React, { useState, useRef, useEffect } from "react";
import { ChatThread, ChatMessage, Meme } from "../types";
import { MEME_DECK, getMemeById } from "../memesData";
import MemeView from "./MemeView";
import { ArrowLeft, Send, Smile, Image, X, Award } from "lucide-react";
import { playMessageSound } from "../audioUtils";

interface ChatWindowProps {
  thread: ChatThread;
  userName: string;
  userPersonaTitle: string;
  customMemes: Meme[];
  onBack: () => void;
  onSendMessage: (text: string, memeId?: string) => Promise<void>;
}

export default function ChatWindow({
  thread,
  userName,
  userPersonaTitle,
  customMemes,
  onBack,
  onSendMessage
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMemeDrawer, setShowMemeDrawer] = useState(false);
  const [inspectMemeId, setInspectMemeId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages, thread.typing]);

  // Combined lookup supporting static and custom user-created memes
  const findMeme = (memeId: string): Meme | null => {
    const staticMeme = getMemeById(memeId);
    if (staticMeme) return staticMeme;
    const custom = customMemes.find(m => m.id === memeId);
    return custom || null;
  };

  const handleSendText = async () => {
    if (!inputText.trim() || isSending) return;
    const txt = inputText;
    setInputText("");
    setIsSending(true);
    
    // Play sound cue
    playMessageSound();
    
    try {
      await onSendMessage(txt);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMeme = async (meme: Meme) => {
    if (isSending) return;
    setShowMemeDrawer(false);
    setIsSending(true);
    
    // Play sound cue
    playMessageSound();

    try {
      const textMessage = `[Shared Meme: "${meme.title}" - "${meme.content}"]`;
      await onSendMessage(textMessage, meme.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Combine static and custom memes to display in drawer
  const allAvailableMemes = [...customMemes, ...MEME_DECK];

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50 font-sans text-slate-950 overflow-hidden relative">
      
      {/* Thread Header */}
      <div className="bg-white border-b border-slate-100 p-3.5 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Back to matches list"
            id="chat_back_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-xl shadow-inner ${thread.candidateAvatarBg}`}>
              {thread.candidateAvatarEmoji}
            </div>
            <div className="min-w-0 text-left">
              <span className="block font-extrabold text-xs text-slate-900 tracking-tight leading-none">
                {thread.candidateName}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-rose-500 flex items-center gap-0.5 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                <Smile className="w-2.5 h-2.5" />
                {thread.candidateCompatibleTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full px-2 py-1 text-[8.5px] font-bold text-slate-400 font-mono">
          <span>COMEDY SYNC</span>
        </div>
      </div>

      {/* Messages Stage */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0 bg-slate-50">
        {thread.messages.map((msg) => {
          const isUser = msg.sender === "user";
          const hasMeme = !!msg.memeId;
          const meme = hasMeme ? findMeme(msg.memeId!) : null;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 w-full max-w-[85%] ${
                isUser ? "self-end items-end" : "self-start items-start"
              }`}
            >
              {/* Optional Meme attachment */}
              {hasMeme && meme && (
                <button
                  onClick={() => setInspectMemeId(meme.id)}
                  className="w-48 aspect-[4/5] rounded-3xl overflow-hidden shadow-md text-left cursor-pointer border hover:-translate-y-0.5 transition duration-150 mb-1 focus:outline-none"
                  id={`chat-meme-inspect-${msg.id}`}
                >
                  <MemeView meme={meme} />
                </button>
              )}

              {/* Message text bubble */}
              {(!hasMeme || (hasMeme && isUser)) && (
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-[11.5px] font-semibold leading-relaxed shadow-sm text-left ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-250/25 rounded-tl-none"
                  }`}
                >
                  {hasMeme ? `Shared Meme: ${meme?.title || "Custom Draft"} 🖼️` : msg.text}
                </div>
              )}

              {/* Timestamp label */}
              <span className="text-[8px] font-bold text-slate-400 px-1 font-mono tracking-tight select-none">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {thread.typing && (
          <div className="flex flex-col gap-1 self-start items-start w-full">
            <div className="bg-white border border-slate-100 px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-0" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
            </div>
            <span className="text-[8px] font-bold text-slate-400 font-mono italic px-1">
              {thread.candidateName} is laughing...
            </span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Meme Attachment Drawer */}
      {showMemeDrawer && (
        <div className="absolute bottom-[66px] inset-x-0 bg-white border-t border-slate-200 shadow-xl p-3 z-30 flex flex-col gap-2.5 animate-slide-up">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Send Meme Icebreaker
            </span>
            <button
              onClick={() => setShowMemeDrawer(false)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              id="close_meme_drawer_button"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Horizontal scrollable meme selection view */}
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 max-w-full font-sans">
            {allAvailableMemes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSendMeme(m)}
                className="shrink-0 w-44 text-left border rounded-xl hover:border-slate-300 bg-white shadow-sm hover:scale-[1.01] transition-transform focus:outline-none"
                id={`drawer-select-meme-${m.id}`}
              >
                <MemeView meme={m} mini={true} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message input controls */}
      <div className="bg-white border-t border-slate-100/80 p-3 flex items-center gap-2 shadow-inner shrink-0 z-20">
        <button
          onClick={() => setShowMemeDrawer(!showMemeDrawer)}
          type="button"
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            showMemeDrawer
              ? "bg-rose-50 border-rose-250 text-rose-500"
              : "bg-slate-50 border-slate-100 text-slate-500"
          }`}
          title="Share a meme card with them"
          id="toggle_meme_drawer"
        >
          <Image className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder={`Direct message ${thread.candidateName}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
          className="flex-1 bg-slate-50 text-slate-800 border border-slate-105 rounded-xl px-3.5 py-2 text-xs font-semibold placeholder-slate-400 outline-none focus:border-rose-300 transition"
          disabled={isSending}
          id="chat_input_text"
        />

        <button
          onClick={handleSendText}
          disabled={!inputText.trim() || isSending}
          className="p-2.5 rounded-xl bg-rose-500 text-white shadow active:scale-95 transition disabled:bg-slate-200 disabled:text-slate-400 shrink-0 cursor-pointer"
          id="chat_send_submit"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Inspect Meme Dialog Modal overlay */}
      {inspectMemeId && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-[280px] aspect-[4/5] relative">
            <button
              onClick={() => setInspectMemeId(null)}
              className="absolute -top-3.5 -right-3.5 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-800 active:scale-90 transition z-50 cursor-pointer"
              id="close_chat_inspect_meme"
            >
              <X className="w-4 h-4" />
            </button>
            {(() => {
              const meme = findMeme(inspectMemeId);
              return meme ? <MemeView meme={meme} /> : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
