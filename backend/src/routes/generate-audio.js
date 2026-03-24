import express from 'express';
import { generateVoiceover } from '../lib/elevenlabs.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { script, videoId, voiceName, language } = req.body;
    
    if (!script || !videoId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const audioUrl = await generateVoiceover(script, videoId, voiceName, language);
    res.json({ audioUrl });
  } catch (error) {
    console.error("[GENERATE_AUDIO]", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});

export default router;
