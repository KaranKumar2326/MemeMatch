export enum HumorCategory {
  WHOLESOME = "wholesome",
  TECH_DEVELOPER = "tech_developer",
  ABSURDIST_SHITPOST = "absurdist_shitpost",
  DARK_SARCASTIC = "dark_sarcastic",
  DAD_JOKE_PUN = "dad_joke_pun",
  EXISTENTIAL_PHILOSOPHICAL = "existential_philosophical"
}

export interface Meme {
  id: string;
  title: string;
  category: HumorCategory;
  // Visual presentation data
  emoji: string;
  themeColor: string; // Tailwind class like bg-pink-100 border-pink-300
  textColor: string; // text-pink-700
  accentColor: string; // bg-pink-500
  content: string; // The main text of the meme
  bottomCaption?: string;
  // For rendering structured content
  format: "cat" | "code" | "absurd" | "existential" | "conversation" | "status";
  specificData?: any; // To render specific markup
}

export interface HumorScore {
  category: HumorCategory;
  label: string;
  emoji: string;
  score: number; // 0 to 10
}

export interface UserHumorPersona {
  title: string;
  tagline: string;
  description: string;
  avatarEmoji: string;
  avatarBg: string; // tailwind bg color
  bestMatchCategory: HumorCategory;
  worstMatchCategory: HumorCategory;
  scores: HumorScore[];
}

export interface CandidateProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  distance: string; // e.g. "2.4 miles away"
  bio: string;
  avatarEmoji: string;
  avatarBg: string;
  humorBadges: string[];
  humorScores: Record<string, number>; // HumorCategory -> intensity
  favoriteMemeIds: string[];
  personalityPrompt: string; // instruction for Gemini API
  compatibleTitle: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "candidate" | "system";
  text: string;
  timestamp: string;
  memeId?: string; // Optional if they sent a meme
}

export interface ChatThread {
  candidateId: string;
  candidateName: string;
  candidateAvatarEmoji: string;
  candidateAvatarBg: string;
  candidateCompatibleTitle: string;
  messages: ChatMessage[];
  typing: boolean;
}
