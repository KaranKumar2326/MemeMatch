import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { CANDIDATE_DECK } from "./src/candidatesData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini initialization as required
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please supply it via Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. Analyze Humor Endpoint (Structured JSON)
app.post("/api/analyze-humor", async (req, res) => {
  try {
    const { likes, dislikes, userName } = req.body;

    if (!likes || !dislikes) {
      return res.status(400).json({ error: "Missing likes or dislikes lists." });
    }

    const ai = getGemini();

    const systemInstruction = 
      "You are a stellar, highly intuitive, and hilarious relationship therapist / meme psychologist. " +
      "Your sole purpose is to analyze a user's swiping decisions on a baseline set of memes and construct a complete, fun, personalized 'Humor Dating Persona'. " +
      "Be extremely witty, charming, slightly roasting but affectionate, and give them a very distinct persona profile. " +
      "Always return valid JSON adhering strictly to the responseSchema.";

    const prompt = `Construct a Humor Profile for a user named ${userName || "User"}.
    They swiped on a curated set of memes:
    - THEY LIKED memes about: ${likes.join(", ")}
    - THEY DISLIKED memes about: ${dislikes.join(", ")}

    Analyze these choices to form a unified comedy profile. Give them an incredibly creative, custom title like 'Chaos Shitposting Overlord' or 'Cozy Wholesome Cuddlefish' depending on what they liked!
    And generate scores (0 to 10) for all of the following 6 categories:
    1. wholesome (Wholesome & Cozy)
    2. tech_developer (Tech & Developer)
    3. absurdist_shitpost (Absurdist Shitposting)
    4. dark_sarcastic (Sarcastic & Dark)
    5. dad_joke_pun (Dad Jokes & Puns)
    6. existential_philosophical (Existential Dread)
    Provide custom reasoning. Use visual theme colors in tailwind format for 'avatarBg' (e.g., 'bg-pink-100 border-pink-300' for wholesome, 'bg-indigo-100 border-indigo-300' for tech, 'bg-purple-100 border-purple-300' for absurdist/shitpost, bg-amber-100 border-amber-300 for puns, etc.).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A fun, highly custom 3-4 word humor title for the user." },
            tagline: { type: Type.STRING, description: "A single, clever, punchy, self-deprecating dating bio headline." },
            description: { type: Type.STRING, description: "A witty, 3-sentence summary of what their choices say about their personality and dating prospects." },
            avatarEmoji: { type: Type.STRING, description: "A single representative emoji (e.g., 🦦, 🐈‍⬛, 🤖, 🪐, 🧠, 🍟)" },
            avatarBg: { type: Type.STRING, description: "A Tailwind border & bg color styling string." },
            bestMatchCategory: { type: Type.STRING, description: "The category slug they scored highest on." },
            worstMatchCategory: { type: Type.STRING, description: "The category slug they scored lowest on." },
            scores: {
              type: Type.ARRAY,
              description: "Must contain exactly all 6 categories with custom integer scores.",
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  label: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  score: { type: Type.INTEGER }
                },
                required: ["category", "label", "emoji", "score"]
              }
            }
          },
          required: ["title", "tagline", "description", "avatarEmoji", "avatarBg", "bestMatchCategory", "worstMatchCategory", "scores"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini.");
    }

    const humorProfile = JSON.parse(responseText.trim());
    res.json(humorProfile);
  } catch (error: any) {
    console.error("Error in /api/analyze-humor:", error);
    res.status(500).json({ error: error.message || "Failed to analyze humor persona." });
  }
});

// 2. Chat Dialogue Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { candidateId, messages, userPersonaTitle, userName } = req.body;

    if (!candidateId || !messages) {
      return res.status(400).json({ error: "Missing candidateId or messages." });
    }

    const candidate = CANDIDATE_DECK.find(c => c.id === candidateId);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    const ai = getGemini();

    const formattedHistory = messages.map((m: any) => {
      const senderName = m.sender === "user" ? (userName || "User") : candidate.name;
      return `${senderName}: ${m.text}`;
    }).join("\n");

    const systemInstruction = 
      `You are simulating a dating app conversation. Perfect compliance with your personality is key!\n` +
      `Here is your profile details:\n` +
      `- Name: ${candidate.name}\n` +
      `- Age: ${candidate.age}\n` +
      `- Persona Prompt: ${candidate.personalityPrompt}\n\n` +
      `Your dating match has the following Humor Title: "${userPersonaTitle || "Meme Enthusiast"}".\n\n` +
      `Generate the next response from ${candidate.name}. Keep your response within 1-2 sweet, witty, or humorous lines that feel authentic to a mobile chat bubble. Do not add prefix quotes or speaker metadata like '${candidate.name}:'. Respond directly.`;

    const chatPrompt = `Here is the conversation history so far:\n${formattedHistory}\n\nGenerate your reply to their last message as ${candidate.name}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
      config: {
        systemInstruction,
        temperature: 0.85
      }
    });

    const text = response.text;
    res.json({ reply: text ? text.trim() : "Ha! That was definitely a meow-ground mistake on my end. Say again?" });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Failed to generate chat reply." });
  }
});

// 3. Analyze Custom Meme Endpoint
app.post("/api/analyze-custom-meme", async (req, res) => {
  try {
    const { memeContent } = req.body;
    if (!memeContent || memeContent.trim() === "") {
      return res.status(400).json({ error: "Meme content is required." });
    }

    const ai = getGemini();

    const systemInstruction = 
      "You are a stellar comedy editor and meme psychologist. " +
      "Your raw talent lies in analyzing a custom meme submission, classifying it perfectly, and offering " +
      "a clever aesthetic layout configuration and a highly witty rating. " +
      "Always return valid JSON adhering strictly to the responseSchema.";

    const prompt = `Analyze this custom meme text or concept and categorize it:
    "${memeContent}"

    1. Classify it into exactly one of these categories:
       - wholesome (Wholesome comfort, positive pets, cute interactions)
       - tech_developer (Programming, terminal logs, code humor)
       - absurdist_shitpost (Surreal comparisons, chaotic steps, potato topics)
       - dark_sarcastic (Sarcasm, antisocial patterns, relatable retail complaints)
       - dad_joke_pun (Puns, simple jokes, oceanic waved)
       - existential_philosophical (Space time, stars, void, Sisyphean routines)

    2. Provide a hilarious, wittiest title (3 to 5 words).
    3. Select a single representative emoji.
    4. Set suitable styling presets options based on the category:
       - wholesome: themeColor="bg-emerald-50 border-emerald-250", textColor="text-emerald-950", accentColor="bg-emerald-500"
       - tech_developer: themeColor="bg-indigo-50 border-indigo-200", textColor="text-indigo-950", accentColor="bg-indigo-650"
       - absurdist_shitpost: themeColor="bg-purple-50 border-purple-200", textColor="text-purple-950", accentColor="bg-purple-650"
       - dark_sarcastic: themeColor="bg-rose-50 border-rose-250", textColor="text-rose-950", accentColor="bg-rose-550"
       - dad_joke_pun: themeColor="bg-orange-50 border-orange-200", textColor="text-orange-950", accentColor="bg-orange-500"
       - existential_philosophical: themeColor="bg-violet-50 border-violet-250", textColor="text-violet-950", accentColor="bg-violet-600"
    5. Generate a funny bottomCaption to wrap it up professionally.
    6. Write a short 2-sentence 'critique' from the therapist's perspective analyzing what this custom piece tells about their dating prospects.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            emoji: { type: Type.STRING },
            themeColor: { type: Type.STRING },
            textColor: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            bottomCaption: { type: Type.STRING },
            critique: { type: Type.STRING }
          },
          required: ["title", "category", "emoji", "themeColor", "textColor", "accentColor", "bottomCaption", "critique"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from custom meme analysis.");
    }

    const output = JSON.parse(responseText.trim());
    res.json({
      id: `custom-${Date.now()}`,
      title: output.title,
      category: output.category,
      emoji: output.emoji,
      themeColor: output.themeColor,
      textColor: output.textColor,
      accentColor: output.accentColor,
      content: memeContent,
      bottomCaption: output.bottomCaption,
      format: "status",
      critique: output.critique
    });
  } catch (error: any) {
    console.error("Error in /api/analyze-custom-meme:", error);
    res.status(500).json({ error: error.message || "Failed to analyze custom meme." });
  }
});

// Setup Vite Dev Server / Static Hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Meme Dating Server running on http://localhost:${PORT}`);
  });
}

startServer();
