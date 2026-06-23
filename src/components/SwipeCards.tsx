import React, { useState } from "react";
import { CandidateProfile, Meme, UserHumorPersona } from "../types";
import { getMemeById } from "../memesData";
import MemeView from "./MemeView";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, MapPin, Smile, Layers, Flame, Award } from "lucide-react";
import { playSwipeLikeSound, playSwipePassSound } from "../audioUtils";

interface SwipeCardsProps {
  candidates: CandidateProfile[];
  onSwipe: (candidate: CandidateProfile, liked: boolean) => void;
  userPersona: UserHumorPersona | null;
  userGenderPreference?: string;
}

export default function SwipeCards({ candidates, onSwipe, userPersona }: SwipeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewFavoritesType, setViewFavoritesType] = useState<"bio" | "memes">("bio");
  const [inspectMemeId, setInspectMemeId] = useState<string | null>(null);

  const activeCandidate = candidates[currentIndex];

  // Algorithmic humor compatibility overlap ratio
  const calculateCompatibility = (candScores: Record<string, number>) => {
    if (!userPersona || !userPersona.scores) return 82; // Fallback
    let totalDifference = 0;
    let count = 0;
    userPersona.scores.forEach((s) => {
      const candVal = candScores[s.category] ?? 5;
      totalDifference += Math.abs(s.score - candVal);
      count++;
    });
    const avgDiff = totalDifference / count; // Maximum possible difference is 10
    const matchPct = Math.round(100 - (avgDiff * 6.8)); // Standardized scaling factor
    return Math.min(98, Math.max(54, matchPct));
  };

  const handleAction = (liked: boolean) => {
    if (!activeCandidate) return;
    
    // Audio synthesis on response actions
    if (liked) {
      playSwipeLikeSound();
    } else {
      playSwipePassSound();
    }
    
    onSwipe(activeCandidate, liked);
    setCurrentIndex((prev) => prev + 1);
    setViewFavoritesType("bio");
    setInspectMemeId(null);
  };

  if (!activeCandidate || currentIndex >= candidates.length) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 text-center text-slate-950 font-sans h-full">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-3xl shadow-sm">
          💨
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Meme Pool Exhausted!
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-xs px-2 font-medium">
          You have checked all locally formulated matchers. Keep chatting with your existing matches or review your comedy profile Vibe ID!
        </p>
      </div>
    );
  }

  const favoriteMemes: Meme[] = activeCandidate.favoriteMemeIds
    .map(id => getMemeById(id))
    .filter(Boolean) as Meme[];

  const symbiosisRatio = calculateCompatibility(activeCandidate.humorScores);

  return (
    <div className="flex flex-col flex-1 justify-between p-4 h-full text-slate-950 select-none font-sans overflow-hidden">
      
      {/* Upper Swiper Card Frame */}
      <div className="flex-1 flex items-center justify-center min-h-0 relative py-3">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCandidate.id}
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-full max-w-[325px] h-[95%] bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden flex flex-col justify-between absolute"
          >
            {/* Upper profile header panel */}
            <div className="p-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center text-2xl shadow-inner ${activeCandidate.avatarBg}`}>
                  {activeCandidate.avatarEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">{activeCandidate.name}</span>
                    <span className="text-xs font-bold text-slate-600">{activeCandidate.age}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{activeCandidate.distance}</span>
                  </div>
                </div>
              </div>

              {/* Algorithmic Comedy Overlap ratio stamp */}
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-3 py-1 text-center shrink-0">
                <span className="block text-[8px] uppercase font-black tracking-widest text-rose-400 leading-none">
                  COMEDY SYNC
                </span>
                <span className="text-[13px] font-black font-mono text-rose-500 leading-none mt-0.5 block">
                  {symbiosisRatio}%
                </span>
              </div>
            </div>

            {/* Middle panel section: Bio vs Favorite Meme Explorer */}
            <div className="flex-1 p-4.5 overflow-y-auto flex flex-col min-h-0 bg-white">
              {viewFavoritesType === "bio" ? (
                <div className="flex flex-col gap-4">
                  {/* Bio statement */}
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Vibe Prompt Headline
                    </span>
                    <p className="text-xs text-slate-650 font-semibold leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100/50">
                      &ldquo;{activeCandidate.bio}&rdquo;
                    </p>
                  </div>

                  {/* Badges / Humor Vibe */}
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Comedy Chemistry Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {activeCandidate.humorBadges.map((badge, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-extrabold text-slate-700 bg-slate-100 border border-slate-150/40 rounded-xl px-2.5 py-1 flex items-center gap-1"
                        >
                          <Smile className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match psychologist summary */}
                  <div className="mt-1.5 bg-rose-50/30 border border-rose-100/40 p-3 rounded-2xl flex items-center gap-2">
                    <Award className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-[10.5px] font-bold text-rose-700 leading-snug">
                      Your high compatibility on <span className="underline select-none capitalize">{activeCandidate.compatibleTitle.replace("The ", "")}</span> signals witty matching.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  <div className="flex justify-between items-center px-0.5 shrink-0 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-500" />
                      Favorite Meme Deck
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Click card to look closer</span>
                  </div>

                  {/* List profile memes templates */}
                  <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 max-h-[220px] pr-1">
                    {favoriteMemes.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setInspectMemeId(m.id)}
                        className="text-left cursor-pointer w-full focus:outline-none"
                        id={`inspect-meme-${m.id}`}
                      >
                        <MemeView meme={m} mini={true} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lower Toggle selector tabs */}
            <div className="border-t border-slate-50 p-2.5 flex justify-around bg-slate-50/30 shrink-0">
              <button
                onClick={() => setViewFavoritesType("bio")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                  viewFavoritesType === "bio"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="view_bio_tab"
              >
                Bio specs
              </button>
              <button
                onClick={() => setViewFavoritesType("memes")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                  viewFavoritesType === "memes"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="view_fav_memes_tab"
              >
                Joke Files ({favoriteMemes.length})
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Inspect Meme Dialog Modal overlay */}
        <AnimatePresence>
          {inspectMemeId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-40 rounded-3xl"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="w-full max-w-[280px] aspect-[4/5] relative"
              >
                <button
                  onClick={() => setInspectMemeId(null)}
                  className="absolute -top-3.5 -right-3.5 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-800 active:scale-90 transition z-50 cursor-pointer"
                  id="close_inspect_meme_modal"
                >
                  <X className="w-4 h-4" />
                </button>
                {(() => {
                  const meme = getMemeById(inspectMemeId);
                  return meme ? <MemeView meme={meme} /> : null;
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Control buttons stack */}
      <div className="flex justify-center items-center gap-6 pb-4 pt-1 shrink-0">
        {/* Pass candidate */}
        <button
          onClick={() => handleAction(false)}
          className="w-13 h-13 rounded-full bg-white border border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center shadow-md active:scale-90 transition group cursor-pointer"
          title="Swiping pass - Not a fit"
          id="swipe_pass_button"
        >
          <X className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" />
        </button>

        <div className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">
          Swipe Card
        </div>

        {/* Match / Like candidate */}
        <button
          onClick={() => handleAction(true)}
          className="w-13 h-13 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition shadow-rose-500/20 group cursor-pointer"
          title="Swiping match - Let's talk!"
          id="swipe_match_button"
        >
          <Heart className="w-5.5 h-5.5 fill-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
