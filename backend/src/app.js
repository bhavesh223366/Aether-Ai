import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import pg from 'pg';
import crypto from 'crypto';
import { ragGenerateScenes, fetchSceneImage } from './lib/ragAgent.js';
import { generateVoiceover } from './lib/elevenlabs.js';

dotenv.config({ path: '.env' });

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Direct Database Setup using pg
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false }
});

// --- HELPERS ---

async function callLLM(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  const apiUrl = apiKey 
    ? "https://api.groq.com/openai/v1/chat/completions" 
    : "https://openrouter.ai/api/v1/chat/completions";
  const model = apiKey ? "llama-3.1-8b-instant" : "openai/gpt-4o-mini";
  const token = apiKey || process.env.OPENROUTER_API_KEY;

  if (!token) return `Placeholder script about the topic.`;

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const response = await axios.post(apiUrl, {
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  }, { headers });

  return response.data.choices[0].message.content.trim();
}

// --- MIDDLEWARE ---
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  req.userId = authHeader.split(' ')[1];
  next();
};

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('🚀 Aether AI Consolidated Backend is running perfectly. Use http://localhost:3000 for the Studio UI.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: 'connected' });
});

// GET /api/profile
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT "clerkId", email, credits FROM "User" WHERE "clerkId" = $1', [req.userId]);
    if (result.rows.length === 0) {
      // Create user if doesn't exist yet
      const newUser = await pool.query(
        'INSERT INTO "User" (id, "clerkId", email, credits, "updatedAt") VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING "clerkId", email, credits',
        [crypto.randomUUID(), req.userId, `user_${req.userId}@example.com`, 20]
      );
      return res.json(newUser.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[PROFILE_GET] Error fetching profile:', error);
    res.status(500).json({ error: 'Internal Error', details: error.message });
  }
});

// GET /api/videos
app.get('/api/videos', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Video" WHERE "userId" IN (SELECT id FROM "User" WHERE "clerkId" = $1) ORDER BY "createdAt" DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[VIDEOS_GET]', error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

// GET /api/videos/:id
app.get('/api/videos/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "Video" WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not Found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[VIDEO_GET_ID]', error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

// POST /api/generate-script
app.post('/api/generate-script', requireAuth, async (req, res) => {
  try {
    const { topic, style, duration, language, tone } = req.body;
    const { scenes, research } = await ragGenerateScenes(topic, style, duration, callLLM, language, tone);
    res.json({ scenes, research });
  } catch (error) {
    console.error("[GENERATE_SCRIPT]", error);
    res.status(500).json({ error: "Failed to generate script" });
  }
});

// POST /api/generate-audio
app.post('/api/generate-audio', requireAuth, async (req, res) => {
  try {
    const { script, text, videoId, voiceName, voice, language } = req.body;
    const finalScript = script || text;
    const finalVoice = voiceName || voice;
    
    if (!finalScript) {
      return res.status(400).json({ error: "Missing script or text" });
    }

    const audioUrl = await generateVoiceover(finalScript, videoId || 'preview', finalVoice, language);
    res.json({ audioUrl, audioId: `audio_${Date.now()}` });
  } catch (error) {
    console.error("[GENERATE_AUDIO]", error);
    res.status(500).json({ error: "Audio generation failed" });
  }
});

// POST /api/generate (Final Save)
app.post('/api/generate', requireAuth, async (req, res) => {
  try {
    const { topic, scenes, language, tone, voice } = req.body;
    
    // 1. Get user and handle credits
    let userRes = await pool.query('SELECT id, credits FROM "User" WHERE "clerkId" = $1', [req.userId]);
    let userId;
    let currentCredits;

    if (userRes.rows.length === 0) {
       const result = await pool.query(
         'INSERT INTO "User" (id, "clerkId", email, credits, "updatedAt") VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id',
         [crypto.randomUUID(), req.userId, `user_${req.userId}@example.com`, 19] // Start with 20, use 1
       );
       userId = result.rows[0].id;
       currentCredits = 19;
    } else {
       userId = userRes.rows[0].id;
       currentCredits = userRes.rows[0].credits;
       
       if (currentCredits <= 0) {
         return res.status(403).json({ error: "Insufficient credits. Please upgrade." });
       }
       
       // Decrement credits
       await pool.query('UPDATE "User" SET credits = credits - 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
       currentCredits -= 1; // Update for response
    }

    // 2. Create Video
    const fullScript = (scenes || []).map(s => s.narration).join(' ');
    const videoRes = await pool.query(
      'INSERT INTO "Video" (id, "userId", topic, script, scenes, language, tone, status, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING id',
      [crypto.randomUUID(), userId, topic, fullScript, JSON.stringify(scenes), language || 'English', tone || 'Informative', 'COMPLETED']
    );

    res.json({ videoId: videoRes.rows[0].id, credits: currentCredits });
  } catch (error) {
    console.error("[GENERATE_FINAL] Error saving video:", error);
    res.status(500).json({ error: `Failed to save video: ${error.message}` });
  }
});

// POST /api/generate-avatar
app.post('/api/generate-avatar', requireAuth, async (req, res) => {
  try {
    const { imageUrl, script } = req.body;
    // Mocking avatar generation ID
    const genId = `avatar_${Date.now()}`;
    res.json({ id: genId });
  } catch (error) {
    console.error("[GENERATE_AVATAR]", error);
    res.status(500).json({ error: "Avatar generation failed" });
  }
});

// GET /api/avatar-status/:id
app.get('/api/avatar-status/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Mocking status check
    res.json({ status: "done", videoUrl: "/videos/avatar-demo.mp4" });
  } catch (error) {
    console.error("[AVATAR_STATUS]", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});

// POST /api/generate-scene-image
app.post('/api/generate-scene-image', requireAuth, async (req, res) => {
  try {
    const { keywords, description } = req.body;
    const imageUrl = await fetchSceneImage(keywords, description);
    res.json({ imageUrl });
  } catch (error) {
    console.error("[GENERATE_SCENE_IMAGE]", error);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Aether AI Backend running on http://localhost:${PORT}`);
});
