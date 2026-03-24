import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/videos
router.get('/', requireAuth, async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        user: { clerkId: req.userId },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(videos);
  } catch (error) {
    console.error('[VIDEOS_GET]', error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

// POST /api/videos (Create/Save)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { topic, script, scenes, audioUrl, language, tone } = req.body;
    
    // Find internal user by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId: req.userId }
    });

    if (!user) {
      // Create user if not exists (sync with Clerk)
      user = await prisma.user.create({
        data: {
          clerkId: req.userId,
          email: 'placeholder@example.com', // In real app, get from Clerk
          credits: 20
        }
      });
    }

    const video = await prisma.video.create({
      data: {
        userId: user.id,
        topic,
        script,
        scenes,
        audioUrl,
        language,
        tone,
        status: 'COMPLETED'
      }
    });

    res.json(video);
  } catch (error) {
    console.error('[VIDEOS_POST]', error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

export default router;
