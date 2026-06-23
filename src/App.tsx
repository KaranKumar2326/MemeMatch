import React, { useState, useEffect } from "react";
import { UserHumorPersona, CandidateProfile, ChatThread, ChatMessage, Meme } from "./types";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, onSnapshot, getDoc, setDoc, query, where, orderBy, addDoc, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { seedCandidateProfilesIfEmpty } from "./dbSeeder";
import AuthScreen from "./components/AuthScreen";
import HumorQuiz from "./components/HumorQuiz";
import HumorProfileView from "./components/HumorProfileView";
import SwipeCards from "./components/SwipeCards";
import ChatsList from "./components/ChatsList";
import ChatWindow from "./components/ChatWindow";
import { Sparkles, MessageSquare, Flame, Heart, RefreshCw, LogOut, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playMatchSound, playMessageSound } from "./audioUtils";

export default function App() {
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Profile state loaded from Firestore
  const [userName, setUserName] = useState<string>("");
  const [userPersona, setUserPersona] = useState<UserHumorPersona | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Active view states
  const [activeTab, setActiveTab] = useState<"discover" | "chats" | "profile">("discover");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Real-time matches and swipe parameters
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [customMemes, setCustomMemes] = useState<Meme[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Match alert modal overlay
  const [matchAlert, setMatchAlert] = useState<{
    candidate: CandidateProfile;
    reason: string;
  } | null>(null);

  // 1. Monitor Authentication State of real users
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setUserId(user.uid);
        // Ensure starting defaults populated
        await seedCandidateProfilesIfEmpty();
        await fetchUserProfile(user.uid);
      } else {
        setUserId(null);
        setUserName("");
        setUserPersona(null);
        setThreads([]);
        setCandidates([]);
        setCustomMemes([]);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // 2. Load Real-Time Matches & Sub-messages history
  useEffect(() => {
    if (!userId) return;

    // Load custom user memes from localStorage to keep client-draft templates
    try {
      const saved = localStorage.getItem(`meme_custom_${userId}`);
      if (saved) {
        setCustomMemes(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }

    const matchesQuery = query(
      collection(db, "matches"),
      where("uids", "array-contains", userId)
    );

    // Dictionary of fetched profiles to prevent redundant Firestore calls
    const partnerProfileCache: Record<string, any> = {};

    const unsubscribeMatches = onSnapshot(matchesQuery, async (matchesSnapshot) => {
      const updatedThreads: ChatThread[] = [];

      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        const matchId = matchDoc.id;
        const partnerUid = matchData.uids.find((uid: string) => uid !== userId);

        if (!partnerUid) continue;

        // Retrieve partner profile (use cache if already fetched)
        let partnerProfile = partnerProfileCache[partnerUid];
        if (!partnerProfile) {
          try {
            const profileRef = doc(db, "users", partnerUid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              partnerProfile = profileSnap.data();
              partnerProfileCache[partnerUid] = partnerProfile;
            } else {
              partnerProfile = {
                name: "Compatible Partner",
                avatarEmoji: "💖",
                avatarBg: "bg-slate-100",
                compatibleTitle: "Comedy Enthusiast",
                isSeeded: false
              };
            }
          } catch (err) {
            console.error(err);
          }
        }

        // Create thread model
        const thread: ChatThread = {
          candidateId: partnerUid,
          candidateName: partnerProfile.name,
          candidateAvatarEmoji: partnerProfile.avatarEmoji,
          candidateAvatarBg: partnerProfile.avatarBg,
          candidateCompatibleTitle: partnerProfile.compatibleTitle || "Meme Match",
          messages: [],
          typing: false
        };

        // Fetch subcollection messages in real-time
        const messagesRef = collection(db, `matches/${matchId}/messages`);
        // We can subscribe to the messages snapshot inline
        const messagesQuery = query(messagesRef, orderBy("timestampRaw", "asc"));
        
        onSnapshot(messagesQuery, (msgSnap) => {
          const msgs: ChatMessage[] = msgSnap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              sender: data.sender,
              text: data.text,
              timestamp: data.timestamp || "Just now",
              memeId: data.memeId
            };
          });

          setThreads((currentThreads) => {
            const filtered = currentThreads.filter(t => t.candidateId !== partnerUid);
            const updated = { ...thread, messages: msgs };
            return [updated, ...filtered].sort((a, b) => b.candidateName.localeCompare(a.candidateName));
          });
        });
      }
    });

    return () => {
      unsubscribeMatches();
    };
  }, [userId]);

  // Load Swipe Pool dynamically excluding already swiped profiles
  const loadCandidatesPool = async (currentUserId: string, genderPref?: string) => {
    setCandidatesLoading(true);
    try {
      // 1. Fetch user swipes
      const swipesQuery = query(collection(db, "swipes"), where("fromUid", "==", currentUserId));
      const swipesSnapshot = await getDocs(swipesQuery);
      const swipedUids = new Set<string>();
      swipesSnapshot.forEach((docSnap) => {
        swipedUids.add(docSnap.data().toUid);
      });

      // 2. Fetch all completed profiles
      const usersQuery = query(collection(db, "users"), where("isCompleted", "==", true));
      const usersSnapshot = await getDocs(usersQuery);

      const pool: CandidateProfile[] = [];
      usersSnapshot.forEach((docSnap) => {
        const u = docSnap.data();
        if (u.uid !== currentUserId && !swipedUids.has(u.uid)) {
          pool.push({
            id: u.uid,
            name: u.name,
            age: u.age || 23,
            gender: u.gender || "Non-binary",
            distance: u.distance || "3 miles away",
            bio: u.bio || "Searching for pure laughs.",
            avatarEmoji: u.avatarEmoji || "🦦",
            avatarBg: u.avatarBg || "bg-pink-100 border-pink-300",
            humorBadges: u.humorBadges || [],
            humorScores: u.humorScores || {},
            favoriteMemeIds: u.favoriteMemeIds || [],
            compatibleTitle: u.compatibleTitle || "Humor Sync",
            personalityPrompt: u.personalityPrompt || ""
          });
        }
      });

      setCandidates(pool);
    } catch (err) {
      console.error("Failed loading candidate profiles:", err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchUserProfile = async (uid: string) => {
    setProfileLoading(true);
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists() && docSnap.data().isCompleted) {
        const data = docSnap.data();
        setUserName(data.name);
        setUserPersona(data.persona);
        await loadCandidatesPool(uid, data.gender);
      } else {
        setUserPersona(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Calibration completion: save new profile directly to Firestore
  const handleQuizComplete = async (persona: UserHumorPersona, finalName: string) => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      const uRef = doc(db, "users", userId);
      const profileData = {
        uid: userId,
        name: finalName,
        age: 23,
        gender: "Non-binary",
        distance: "0 miles away (You)",
        bio: persona.tagline,
        avatarEmoji: persona.avatarEmoji,
        avatarBg: persona.avatarBg,
        humorBadges: [persona.title],
        humorScores: persona.scores.reduce((acc, s) => ({ ...acc, [s.category]: s.score }), {}),
        favoriteMemeIds: ["wholesome-1", "tech-1"],
        compatibleTitle: persona.title,
        personalityPrompt: `You match perfectly parameters of high-fidelity humor with title ${persona.title}`,
        persona: persona,
        isCompleted: true,
        isSeeded: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(uRef, profileData, { merge: true });
      setUserName(finalName);
      setUserPersona(persona);
      await loadCandidatesPool(userId, "Non-binary");
      setActiveTab("discover");
    } catch (err) {
      console.error("Failed storing calibration persona:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Swiping card actions
  const handleSwipe = async (candidate: CandidateProfile, liked: boolean) => {
    if (!userId) return;

    try {
      const swipeId = `${userId}_${candidate.id}`;
      // 1. Log swipe action
      await setDoc(doc(db, "swipes", swipeId), {
        fromUid: userId,
        toUid: candidate.id,
        action: liked ? "like" : "pass",
        createdAt: new Date().toISOString()
      });

      if (liked) {
        // 2. Check compatibility match (auto match seeded candidates, or search reciprocal likes)
        let isMatched = false;
        
        // Fetch target info to check if they are seeded
        const targetRef = doc(db, "users", candidate.id);
        const targetSnap = await getDoc(targetRef);
        const targetData = targetSnap.exists() ? targetSnap.data() : null;
        const isSeeded = targetData ? !!targetData.isSeeded : false;

        if (isSeeded) {
          isMatched = true;
        } else {
          // Check if reciprocal swipe is like
          const opposingSwipeRef = doc(db, "swipes", `${candidate.id}_${userId}`);
          const oppSnap = await getDoc(opposingSwipeRef);
          if (oppSnap.exists() && oppSnap.data().action === "like") {
            isMatched = true;
          }
        }

        if (isMatched) {
          const matchId = [userId, candidate.id].sort().join("_");
          const reasons = [
            `You both love tech sarcasm and think restarting the dev server is peak engineering.`,
            `You both shared the ultimate existential cat jokes—an undeniable gravitational alignment!`,
            `You both agree that code comments are optional and coffee is non-negotiable.`,
            `You are both stardust particles escaping existential void routines.`
          ];
          const matchReason = reasons[Math.floor(Math.random() * reasons.length)];

          // Log match link
          await setDoc(doc(db, "matches", matchId), {
            matchId,
            uids: [userId, candidate.id],
            reason: matchReason,
            createdAt: new Date().toISOString()
          });

          // Insert system opener message
          const messagesRef = collection(db, `matches/${matchId}/messages`);
          await addDoc(messagesRef, {
            sender: "system",
            text: `🎉 You matched on ${candidate.name}'s humor metrics!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timestampRaw: new Date().toISOString()
          });

          // If seeded profile, insert prompt opener bubble from bot
          if (isSeeded) {
            await addDoc(messagesRef, {
              sender: "candidate",
              text: `hey! we both laughed at those memes. absolute perfect compilation right there. what is up?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              timestampRaw: new Date().toISOString()
            });
          }

          playMatchSound();
          setMatchAlert({
            candidate,
            reason: matchReason
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Securely proxying messages and routing responses
  const handleSendMessage = async (text: string, memeId?: string) => {
    if (!userId || !activeThreadId || !userPersona) return;

    try {
      const matchId = [userId, activeThreadId].sort().join("_");
      const messagesRef = collection(db, `matches/${matchId}/messages`);

      // Write user message
      await addDoc(messagesRef, {
        sender: "user",
        text,
        memeId: memeId || "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestampRaw: new Date().toISOString()
      });

      // Check if thread target is seeded (AI simulated candidate)
      const targetRef = doc(db, "users", activeThreadId);
      const targetSnap = await getDoc(targetRef);
      const targetData = targetSnap.exists() ? targetSnap.data() : null;
      const isSeeded = targetData ? !!targetData.isSeeded : false;

      if (isSeeded) {
        // Trigger simulated typing indicator on Firestore side
        const threadDocRef = doc(db, "matches", matchId);
        
        // Retrieve full conversation for Gemini proxy request
        const currentThread = threads.find(t => t.candidateId === activeThreadId);
        const mockMessagesHistory = [
          ...(currentThread?.messages || []),
          { sender: "user", text }
        ];

        // Fetch reply from Gemini backend endpoint
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: activeThreadId,
            messages: mockMessagesHistory,
            userPersonaTitle: userPersona.title,
            userName: userName
          })
        });

        if (!response.ok) {
          throw new Error("Simulated partner dialogue failed.");
        }

        const data = await response.json();

        // Write reply back into Firestore messages history
        await addDoc(messagesRef, {
          sender: "candidate",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestampRaw: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomMeme = (meme: Meme) => {
    if (!userId) return;
    const updated = [meme, ...customMemes];
    setCustomMemes(updated);
    localStorage.setItem(`meme_custom_${userId}`, JSON.stringify(updated));
  };

  const handleRemoveCustomMeme = (id: string) => {
    if (!userId) return;
    const updated = customMemes.filter(m => m.id !== id);
    setCustomMemes(updated);
    localStorage.setItem(`meme_custom_${userId}`, JSON.stringify(updated));
  };

  const handleSignOut = async () => {
    if (confirm("Sign out of MemeMatch?")) {
      await signOut(auth);
    }
  };

  const startTalking = () => {
    if (!matchAlert) return;
    setActiveTab("chats");
    setActiveThreadId(matchAlert.candidate.id);
    setMatchAlert(null);
  };

  const activeThreadObj = threads.find(t => t.candidateId === activeThreadId);

  return (
    // Full screen — no phone mockup. Safe area insets handle real device notch/status bar.
    <div className="w-full bg-white flex flex-col" style={{
      minHeight: '100dvh',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>

        {/* Dynamic State Router */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50" style={{minHeight: 0}}>
          
          {authLoading ? (
            <div className="flex flex-col flex-1 items-center justify-center p-6 text-center select-none">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-500">Connecting to secure authentication...</p>
            </div>
          ) : !userId ? (
            <AuthScreen onAuthSuccess={(uid) => fetchUserProfile(uid)} />
          ) : profileLoading ? (
            <div className="flex flex-col flex-1 items-center justify-center p-6 text-center">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-500">Decrypting humor registry profile...</p>
            </div>
          ) : !userPersona ? (
            <HumorQuiz onQuizComplete={handleQuizComplete} />
          ) : activeThreadId && activeThreadObj ? (
            <ChatWindow
              thread={activeThreadObj}
              userName={userName}
              userPersonaTitle={userPersona.title}
              customMemes={customMemes}
              onBack={() => setActiveThreadId(null)}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <>
              {/* Header Tab panel */}
              <div className="bg-white border-b border-slate-100/80 p-3.5 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-6.5 h-6.5 rounded-lg bg-rose-500 font-black text-white text-sm flex items-center justify-center shadow">
                    M
                  </div>
                  <div className="text-left leading-none">
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-none block">MemeMatch</span>
                    <span className="text-[8px] tracking-wider uppercase font-black text-rose-400 pl-0.5 leading-none block">Dating Room</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      if (confirm("Reset current swipe deck and re-poll new user candidates?")) {
                        await loadCandidatesPool(userId, userPersona.bestMatchCategory);
                      }
                    }}
                    className="p-1 px-1.5 text-[8.5px] font-bold text-slate-500 hover:text-rose-500 border border-slate-150 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    title="Refresh Swiping Pool"
                    id="btn_app_header_refresh"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Poll Pool
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="p-1 text-slate-400 hover:text-rose-500 border border-slate-150 rounded-lg flex items-center transition cursor-pointer"
                    title="Sign Out"
                    id="btn_app_header_logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Central components view */}
              <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
                {activeTab === "discover" && (
                  candidatesLoading ? (
                    <div className="flex flex-col flex-1 items-center justify-center p-6 text-center">
                      <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                      <p className="text-xs font-semibold text-slate-500">Sifting compatible chemistry cells...</p>
                    </div>
                  ) : (
                    <SwipeCards
                      candidates={candidates}
                      onSwipe={handleSwipe}
                      userPersona={userPersona}
                    />
                  )
                )}
                {activeTab === "chats" && (
                  <ChatsList
                    threads={threads}
                    onSelectThread={(t) => setActiveThreadId(t.candidateId)}
                  />
                )}
                {activeTab === "profile" && (
                  <HumorProfileView
                    persona={userPersona}
                    userName={userName}
                    customMemes={customMemes}
                    onAddCustomMeme={handleAddCustomMeme}
                    onRemoveCustomMeme={handleRemoveCustomMeme}
                  />
                )}
              </div>

              {/* Tab Navigation bottom tray */}
              <div className="bg-white border-t border-slate-100 p-2 flex justify-around shadow-xs shrink-0 z-20">
                <button
                  onClick={() => {
                    setActiveTab("discover");
                    setActiveThreadId(null);
                  }}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                    activeTab === "discover" ? "text-rose-500 scale-102" : "text-slate-400 hover:text-slate-700"
                  }`}
                  id="tab_discover_nav"
                >
                  <Flame className="w-5 h-5" />
                  <span className="text-[9px] font-bold tracking-wider uppercase">Swipe Pool</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("chats");
                    setActiveThreadId(null);
                  }}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition relative cursor-pointer ${
                    activeTab === "chats" ? "text-rose-500 scale-102" : "text-slate-400 hover:text-slate-700"
                  }`}
                  id="tab_chats_nav"
                >
                  <MessageSquare className="w-5 h-5" />
                  {threads.length > 0 && (
                    <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-rose-500 border border-white animate-pulse" />
                  )}
                  <span className="text-[9px] font-bold tracking-wider uppercase">Matches ({threads.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setActiveThreadId(null);
                  }}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                    activeTab === "profile" ? "text-rose-500 scale-102" : "text-slate-405 hover:text-slate-700"
                  }`}
                  id="tab_profile_nav"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs bg-slate-100">
                    {userPersona.avatarEmoji}
                  </div>
                  <span className="text-[9px] font-bold tracking-wider uppercase">My Vibe</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Full screen Match overlay alerts */}
        <AnimatePresence>
          {matchAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 z-55 flex flex-col justify-between p-6 text-center text-white"
            >
              <div className="flex flex-col items-center text-center mt-12 gap-1.5 shrink-0">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl shadow animate-bounce">
                  ⚡
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase mt-2 text-yellow-400 select-none animate-pulse">
                  It&apos;s a Match!
                </h2>
                <p className="text-xs font-bold text-slate-300 max-w-xs mt-1 leading-relaxed">
                  Real match registered on the database! You matched on humor metrics with {matchAlert.candidate.name}.
                </p>
              </div>

              {/* Matched profile intersections */}
              <div className="flex items-center justify-center gap-3 py-6 my-auto relative shrink-0">
                <div className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-4xl shadow-lg relative -mr-2 rotate-[-8deg] ${userPersona?.avatarBg}`}>
                  {userPersona?.avatarEmoji}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-lg border-2 border-white absolute z-20">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>

                <div className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-4xl shadow-lg relative -ml-2 rotate-[8deg] ${matchAlert.candidate.avatarBg}`}>
                  {matchAlert.candidate.avatarEmoji}
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-3xl border border-white/15 max-w-sm mx-auto mb-4 flex flex-col gap-1 text-left shrink-0">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-yellow-400 font-mono">
                  Sync Intelligence
                </span>
                <p className="text-xs font-semibold leading-relaxed text-slate-150">
                  {matchAlert.reason}
                </p>
              </div>

              <div className="flex flex-col gap-2.5 mb-6 w-full max-w-xs mx-auto shrink-0">
                <button
                  onClick={startTalking}
                  className="w-full bg-rose-500 text-white py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-rose-500/10 cursor-pointer"
                  id="match_open_chat"
                >
                  Send a Funny Opener 💬
                </button>
                <button
                  onClick={() => setMatchAlert(null)}
                  className="w-full bg-white/10 text-slate-300 py-3 rounded-2xl font-bold hover:text-white transition cursor-pointer"
                  id="match_keep_swiping"
                >
                  Keep Swiping Cards
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
