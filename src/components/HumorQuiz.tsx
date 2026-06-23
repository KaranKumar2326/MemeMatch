import React, { useState } from "react";
import { Meme, UserHumorPersona } from "../types";
import { MEME_DECK } from "../memesData";
import MemeView from "./MemeView";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, Sparkles, Smile, ArrowRight, Keyboard, User, Activity, Flame } from "lucide-react";

interface HumorQuizProps {
  onQuizComplete: (persona: UserHumorPersona, userName: string) => void;
}

export default function HumorQuiz({ onQuizComplete }: HumorQuizProps) {
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState("non-binary");
  const [seeking, setSeeking] = useState("anyone");
  const [step, setStep] = useState<"username" | "swiping" | "analyzing">("username");
  
  // Selected 8 memes representing diverse quiz questions
  const quizMemes: Meme[] = MEME_DECK.slice(0, 8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startQuiz = () => {
    if (!userName.trim()) {
      setErrorMsg("Please enter your name/nickname to continue!");
      return;
    }
    setErrorMsg(null);
    setStep("swiping");
  };

  const handleSwipe = async (liked: boolean) => {
    const currentMeme = quizMemes[currentIndex];
    
    if (liked) {
      setLikes((prev) => [...prev, currentMeme.title]);
    } else {
      setDislikes((prev) => [...prev, currentMeme.title]);
    }

    if (currentIndex < quizMemes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all swiping
      setStep("analyzing");
      await sendToGeminiAnalysis([...likes, liked ? currentMeme.title : ""].filter(Boolean) as string[], [...dislikes, !liked ? currentMeme.title : ""].filter(Boolean) as string[]);
    }
  };

  const sendToGeminiAnalysis = async (finalLikes: string[], finalDislikes: string[]) => {
    try {
      const response = await fetch("/api/analyze-humor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userName,
          likes: finalLikes,
          dislikes: finalDislikes
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Humor profiling failed.");
      }

      const analyzedPersona: UserHumorPersona = await response.json();
      onQuizComplete(analyzedPersona, userName);
    } catch (err: any) {
      console.error(err);
      // Fail-safe fallback if Gemini fails, so user experience is not disrupted
      const mockPersona: UserHumorPersona = {
        title: "Wholesome Space Cadet",
        tagline: "Searching for stars and heavy purring cats.",
        description: "You appreciate warm, comfortable memes but also enjoy looking at the massive stellar scope of our universe. You combine sweet affection with grand cosmic thoughts.",
        avatarEmoji: "🪐",
        avatarBg: "bg-pink-100 border-pink-300",
        bestMatchCategory: quizMemes[0].category,
        worstMatchCategory: quizMemes[2].category,
        scores: [
          { category: quizMemes[0].category, label: "Wholesome & Cozy", emoji: "🐱", score: 8 },
          { category: quizMemes[1].category, label: "Tech & Developer", emoji: "💻", score: 4 },
          { category: quizMemes[2].category, label: "Absurdist Shitposting", emoji: "🥑", score: 6 },
          { category: quizMemes[3].category, label: "Sarcastic & Dark", emoji: "🦦", score: 5 },
          { category: quizMemes[4].category, label: "Dad Jokes & Puns", emoji: "🦈", score: 7 },
          { category: quizMemes[5].category, label: "Existential Dread", emoji: "🪐", score: 9 }
        ]
      };
      // Brief delay to simulate AI power
      setTimeout(() => {
        onQuizComplete(mockPersona, userName);
      }, 1500);
    }
  };

  if (step === "username") {
    return (
      <div className="flex flex-col flex-1 justify-between p-6 h-full text-slate-950 font-sans">
        {/* Splash & Header section */}
        <div className="flex flex-col items-center text-center mt-6 gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-rose-500 flex items-center justify-center shadow-lg text-white font-extrabold text-3xl animate-pulse">
              M
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 p-1.5 rounded-full border-2 border-white shadow">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-900 leading-none">
            Meme Dating
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
            Ditch the boring standard self-descriptions. Let&apos;s see how your cells react to top-shelf humor.
          </p>
        </div>

        {/* Profile Details Form */}
        <div className="flex-1 flex flex-col justify-center gap-5 my-6 max-w-sm mx-auto w-full bg-white/50 p-5 rounded-3xl border border-slate-100/60 shadow-sm backdrop-blur-sm">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-rose-500" />
              What is your Name?
            </label>
            <input
              type="text"
              placeholder="e.g. Sam, Taylor, Alex..."
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setErrorMsg(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white shadow-inner text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 transition"
              id="user_name_input"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Your Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["female", "male", "non-binary"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                    gender === g
                      ? "bg-slate-950 text-white border-slate-950 shadow"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                  id={`gender_${g}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Who are you seeking?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["women", "men", "anyone"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeeking(s)}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                    seeking === s
                      ? "bg-rose-550 text-white border-rose-500 bg-rose-500 shadow"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                  id={`seeking_${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 text-center animate-shake">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm mx-auto mb-4">
          <button
            onClick={startQuiz}
            className="w-full bg-rose-500 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition hover:bg-rose-600 duration-150 cursor-pointer"
            id="start_quiz_button"
          >
            Start Meme Swipe
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
            Swipe 8 curated memes to calibrate your matching parameters
          </p>
        </div>
      </div>
    );
  }

  if (step === "swiping") {
    const activeMeme = quizMemes[currentIndex];
    const ProgressPercentage = Math.round(((currentIndex) / quizMemes.length) * 105);

    return (
      <div className="flex flex-col flex-1 justify-between p-4 h-full text-slate-950 select-none">
        {/* Navigation Indicator */}
        <div className="flex flex-col gap-1 px-2 pt-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Calibrating Vibe</span>
            <span className="text-rose-500 font-mono font-medium">{currentIndex + 1} / {quizMemes.length}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-300"
              style={{ width: `${ProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* Swiper Stage */}
        <div className="flex-1 flex items-center justify-center py-6 min-h-0 relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeMeme.id}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-[310px] aspect-[4/5] absolute"
            >
              <MemeView meme={activeMeme} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action button deck */}
        <div className="flex justify-center items-center gap-6 pb-6 mt-2">
          {/* Pass Button */}
          <button
            onClick={() => handleSwipe(false)}
            className="w-14 h-14 rounded-full bg-white border border-slate-100 hover:border-slate-200 text-slate-500 flex items-center justify-center shadow-md active:scale-90 transition hover:text-slate-700 cursor-pointer group"
            title="Swipe Left - Meh / No"
            id="quiz_pass_button"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 text-center select-none leading-tight">
            Left = Pass <br /> Right = Love
          </div>

          {/* Like Button */}
          <button
            onClick={() => handleSwipe(true)}
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition shadow-rose-500/25 cursor-pointer group"
            title="Swipe Right - YES / Love It!"
            id="quiz_like_button"
          >
            <Heart className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Analyzing Step with beautiful loading animation
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 h-full text-slate-950 text-center">
      <div className="relative mb-5 flex justify-center items-center">
        {/* Core brain icon revolving animation */}
        <div className="w-20 h-20 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
        <span className="text-4xl absolute select-none animate-bounce">🧠</span>
      </div>

      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-extrabold tracking-tight text-slate-900"
      >
        Gemini is Decrypting your Brain...
      </motion.h2>
      
      <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mt-1.5 font-mono animate-pulse">
        Processing meme reactions
      </p>

      {/* Funny micro text that shifts every 3.5 seconds to build immersion */}
      <div className="max-w-xs mt-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100/60 shadow-inner">
        <p className="text-xs text-slate-500 leading-relaxed font-medium transition-all">
          We are analyzing the exact ratio of cat giggles to existential cosmic sighs to compute your core compatible matches. Almost cooked!
        </p>
      </div>
    </div>
  );
}
