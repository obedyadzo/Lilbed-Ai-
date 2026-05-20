import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client on the server.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Research / Q&A Endpoint
app.post("/api/research", async (req, res) => {
  try {
    const { prompt, history = [], depth = "deep" } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const contents: any[] = [];
    
    // Process conversation history if present
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // System instruction configured for scientific, accurate research and footnotes citation
    let systemInstruction = `You are Lilbed AI, a hyper-intelligent global research system and online analytical investigator.
Your absolute objective is to answer the user's inquiry with extreme precision, logical reasoning, and deep investigation by conducting verified global web search.

Guidelines:
1. Conduct highly analytical, factual, and unbiased investigations.
2. Structure answers beautifully with clean headings, markdown bullet points, tables, and comparison grids where helpful.
3. Be comprehensive. Do not summarize prematurely. Ensure complex concepts are thoroughly explained step-by-step.
4. ALWAYS cite specific sources throughout your explanation. Use numbered inline citations in brackets, such as [1], [2], [3], etc. corresponding to the actual sources provided.
5. If the current date or real-time context is relevant, remember today's date is May 20, 2026.`;

    if (depth === "deep") {
      systemInstruction += `\n6. Dive extremely deep. Analyze background history, surrounding context, multiple perspectives, and current consensus of the topic.`;
    } else {
      systemInstruction += `\n6. Keep the answers precise, focused, and directly addressing the user's explicit question, while ensuring it is fully grounded.`;
    }

    // Add current query
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // low temperature for high facts accuracy and minimal hallucinations
      },
    });

    const text = response.text || "Unable to produce content.";
    const metadata = response.candidates?.[0]?.groundingMetadata;

    const chunks = metadata?.groundingChunks || [];
    const webSearchQueries = metadata?.webSearchQueries || [];

    // Map chunks to numbered references
    const sources = chunks
      .map((chunk: any, index: number) => ({
        id: index + 1,
        title: chunk.web?.title || chunk.web?.uri || "Web Source",
        url: chunk.web?.uri || "",
      }))
      .filter((s: any) => s.url);

    res.json({
      text,
      queries: webSearchQueries,
      sources,
    });

  } catch (error: any) {
    console.error("Lilbed AI research endpoint error:", error);
    res.status(500).json({ error: error?.message || "An error occurred during global research retrieval." });
  }
});

// ChatGPT Assistant Conversational Endpoint
app.post("/api/chatgpt", async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const contents: any[] = [];
    
    // Convert history
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const systemInstruction = `You are a ChatGPT-equivalent conversational co-pilot fully integrated within the Lilbed workspace.
Provide immediate, lightning-fast guidance on code templates, copywriting revisions, grammar rephrasing, and logical explanations.
Be witty, conversational, clear, and perfectly tailored to creative assistance.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7, // higher temperature for creative ChatGPT feel
      },
    });

    res.json({
      text: response.text || "No response produced by chat co-pilot."
    });

  } catch (err: any) {
    console.error("ChatGPT endpoint error:", err);
    res.status(500).json({ error: err?.message || "ChatGPT co-pilot failed to respond." });
  }
});

// Vite middleware development vs static production mode
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
    console.log(`Lilbed AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
