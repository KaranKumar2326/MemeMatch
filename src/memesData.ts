import { Meme, HumorCategory } from "./types";

export const MEME_DECK: Meme[] = [
  // Wholesome Meme 1
  {
    id: "wholesome-1",
    title: "High Performance Therapy",
    category: HumorCategory.WHOLESOME,
    emoji: "🐱",
    themeColor: "bg-emerald-50 border-emerald-200",
    textColor: "text-emerald-900",
    accentColor: "bg-emerald-500",
    content: "My cat when I start crying about work, rent, and the economy",
    bottomCaption: "*lays extremely heavy purring body directly on my chest so I cannot breathe*",
    format: "cat"
  },
  // Wholesome Meme 2
  {
    id: "wholesome-2",
    title: "Universal Emotional Support",
    category: HumorCategory.WHOLESOME,
    emoji: "🐶",
    themeColor: "bg-pink-50 border-pink-200",
    textColor: "text-pink-900",
    accentColor: "bg-pink-500",
    content: "You: *has a slightly bad day*\nYour dog: 'I don't know what happened but I'm willing to lick your face for 4 hours straight to resolve it.'",
    bottomCaption: "The ultimate solutionist.",
    format: "status"
  },
  // Tech Meme 1
  {
    id: "tech-1",
    title: "Senior Dev Brain",
    category: HumorCategory.TECH_DEVELOPER,
    emoji: "💻",
    themeColor: "bg-indigo-50 border-indigo-200",
    textColor: "text-indigo-950",
    accentColor: "bg-indigo-600",
    content: "const fixCode = () => {\n  try {\n    writeMoreCode();\n  } catch (error) {\n    cry();\n    restart_dev_server();\n  }\n};",
    bottomCaption: "It works on my machine. ¯\\_(ツ)_/¯",
    format: "code"
  },
  // Tech Meme 2
  {
    id: "tech-2",
    title: "Artificial Intelligence vs Absolute Wisdom",
    category: HumorCategory.TECH_DEVELOPER,
    emoji: "🤖",
    themeColor: "bg-sky-50 border-sky-200",
    textColor: "text-sky-950",
    accentColor: "bg-sky-600",
    content: "AI: I can generate 10,000 lines of complex React components in three seconds.\n\nMe: Yes, but can you figure out why this single nested <div> is centered horizontally but not vertically?",
    bottomCaption: "Vite server restarted. Center still broken.",
    format: "conversation"
  },
  // Absurdist Meme 1
  {
    id: "absurd-1",
    title: "The Ultimate Ingredient",
    category: HumorCategory.ABSURDIST_SHITPOST,
    emoji: "🥑",
    themeColor: "bg-amber-50 border-amber-200",
    textColor: "text-amber-950",
    accentColor: "bg-amber-600",
    content: "Me: *adds garlic to the recipe*\n\nRecipe: Use 2 cloves.\n\nMe: *adds 17 cloves* 'Now the spirits will protect me from interactions.'",
    bottomCaption: "My eyes are watering but my soul is secure.",
    format: "absurd"
  },
  // Absurdist Meme 2
  {
    id: "absurd-2",
    title: "Slight Cognitive Slip",
    category: HumorCategory.ABSURDIST_SHITPOST,
    emoji: "🥄",
    themeColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-950",
    accentColor: "bg-purple-600",
    content: "Eats yogurt.\nThrows spoon in trash.\nPuts yogurt cup in the sink.\nStares at hands for 15 minutes trying to recall my password to humanity.",
    bottomCaption: "System rebooting...",
    format: "status"
  },
  // Sarcastic Meme 1
  {
    id: "sarcastic-1",
    title: "Peak Social Battery",
    category: HumorCategory.DARK_SARCASTIC,
    emoji: "🦦",
    themeColor: "bg-rose-50 border-rose-200",
    textColor: "text-rose-950",
    accentColor: "bg-rose-500",
    content: "'We should totally hang out sometime!'\n\n*Both of us praying silently to the universe that we never actually formulate a date, time, or location*",
    bottomCaption: "Best friends indeed.",
    format: "conversation"
  },
  // Sarcastic Meme 2
  {
    id: "sarcastic-2",
    title: "Spiritual Exhaustion",
    category: HumorCategory.DARK_SARCASTIC,
    emoji: "☕",
    themeColor: "bg-slate-50 border-slate-300",
    textColor: "text-slate-900",
    accentColor: "bg-slate-700",
    content: "My hobby is looking at items in my online shopping cart and then closing the tab because $4.99 shipping represents a personal insult to my legacy.",
    bottomCaption: "$85 items: Safe. $5 shipping: Extortion.",
    format: "status"
  },
  // Dad Joke Meme 1
  {
    id: "dad-1",
    title: "The Oceanic Encounter",
    category: HumorCategory.DAD_JOKE_PUN,
    emoji: "🦈",
    themeColor: "bg-cyan-50 border-cyan-200",
    textColor: "text-cyan-950",
    accentColor: "bg-cyan-500",
    content: "What did the ocean say to the shore?\n\nNothing. It just waved.",
    bottomCaption: "Sea what I did there? 🌊",
    format: "conversation"
  },
  // Dad Joke Meme 2
  {
    id: "dad-2",
    title: "Fungal Friendships",
    category: HumorCategory.DAD_JOKE_PUN,
    emoji: "🍄",
    themeColor: "bg-orange-50 border-orange-200",
    textColor: "text-orange-950",
    accentColor: "bg-orange-500",
    content: "Why did the mushroom go to the party?\n\nBecause he was a fun-gi.",
    bottomCaption: "He really lichen to socialise.",
    format: "conversation"
  },
  // Existential Meme 1
  {
    id: "existential-1",
    title: "Cosmic Perspective",
    category: HumorCategory.EXISTENTIAL_PHILOSOPHICAL,
    emoji: "🪐",
    themeColor: "bg-violet-50 border-violet-200",
    textColor: "text-violet-950",
    accentColor: "bg-violet-600",
    content: "The universe is 13.8 billion years old and expanding into an infinite cold void of entropy.\n\nBut sure, I will definitely worry for 4 days about that slightly weird sound I made when saying 'thanks you too' to the barista.",
    bottomCaption: "Staring into the cosmic foam of awkwardness.",
    format: "existential"
  },
  // Existential Meme 2
  {
    id: "existential-2",
    title: "The Sisyphus Alarm",
    category: HumorCategory.EXISTENTIAL_PHILOSOPHICAL,
    emoji: "🪨",
    themeColor: "bg-teal-50 border-teal-200",
    textColor: "text-teal-900",
    accentColor: "bg-teal-600",
    content: "Waking up at 7 AM to go to work to buy groceries to have the energy to wake up at 7 AM to go to work.",
    bottomCaption: "One must imagine the worker happy.",
    format: "status"
  }
];

export const getMemeById = (id: string): Meme | undefined => {
  return MEME_DECK.find(m => m.id === id);
};
