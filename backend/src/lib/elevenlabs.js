import axios from "axios";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ElevenLabs voice map — voice_id by name + language support
const VOICE_MAP = {
  Rachel:  { id: "21m00Tcm4TlvDq8ikWAM", gender: "female" },
  Matthew: { id: "Yko7PKHZNXotIFUBG7I9", gender: "male"   },
  Antoni:  { id: "ErXwobaYiN019PkySvjV", gender: "male"   },
  Bella:   { id: "EXAVITQu4vr4xnSDxMaL", gender: "female" },
  Josh:    { id: "TxGEqnHWrfWFTfGW9XjX", gender: "male"   },
};

// Languages that need ElevenLabs multilingual model
const MULTILINGUAL_LANGUAGES = ["Spanish", "Hindi", "French", "German", "Portuguese", "Italian", "Japanese", "Korean", "Chinese", "Arabic", "Russian"];

/**
 * Generate natural-sounding voiceover using ElevenLabs TTS API.
 * Automatically switches to multilingual model for non-English languages.
 * Falls back to null (browser TTS) if no API key.
 */
export async function generateVoiceover(script, videoId, voiceName = "Rachel", language = "English") {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.log("⚠️ No ElevenLabs key, will use browser TTS fallback");
    return null;
  }

  try {
    const voice = VOICE_MAP[voiceName] || VOICE_MAP.Rachel;
    const isMultilingual = MULTILINGUAL_LANGUAGES.includes(language);
    // eleven_multilingual_v2 handles 28 languages; eleven_monolingual_v1 is English-only
    const modelId = isMultilingual ? "eleven_multilingual_v2" : "eleven_monolingual_v1";

    console.log(`🎙️ ElevenLabs TTS | voice:${voiceName} | model:${modelId} | lang:${language}`);

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`,
      {
        text: script,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );

    const audioDir = path.join(process.cwd(), "public", "audio");
    await mkdir(audioDir, { recursive: true });
    const fileName = `${videoId}.mp3`;
    const filePath = path.join(audioDir, fileName);
    await writeFile(filePath, Buffer.from(response.data));

    console.log("✅ ElevenLabs voiceover saved:", fileName);
    return `/audio/${fileName}`;
  } catch (error) {
    console.error("ElevenLabs error:", error.response?.data || error.message);
    return null;
  }
}

export const AVAILABLE_VOICES = Object.keys(VOICE_MAP);
