import express from 'express';
import axios from 'axios';
import { ragGenerateScenes } from '../lib/ragAgent.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

async function callLLM(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  const apiUrl = apiKey 
    ? "https://api.groq.com/openai/v1/chat/completions" 
    : "https://openrouter.ai/api/v1/chat/completions";
  const model = apiKey ? "llama-3.1-8b-instant" : "openai/gpt-4o-mini";
  const token = apiKey || process.env.OPENROUTER_API_KEY;

  if (!token) return `Placeholder script about the given topic.`;

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  
  const response = await axios.post(apiUrl, {
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  }, { headers });

  return response.data.choices[0].message.content.trim();
}

/**
 * POST /api/generate-script
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { topic, style, duration, language = "English", tone = "Informative" } = req.body;

    if (!topic || !style || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { scenes, research } = await ragGenerateScenes(
      topic, style, duration, callLLM, language, tone
    );

    res.json({ scenes, research });
  } catch (error) {
    console.error("[GENERATE_SCRIPT]", error);
    res.status(500).json({ error: "Failed to generate script preview" });
  }
});

export default router;
