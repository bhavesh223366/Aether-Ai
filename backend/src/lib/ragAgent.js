import axios from "axios";

/**
 * RAG Agent: Researches a topic online, then uses the context
 * to generate a more factual, engaging video script.
 * Supports language and tone/mood customization.
 */

// Step 1: RESEARCH — Fetch facts from Wikipedia
async function researchTopic(topic) {
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
      { headers: { "User-Agent": "AetherAI/1.0" }, timeout: 5000 }
    );
    return response.data.extract || "";
  } catch {
    try {
      const searchRes = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&srlimit=3`,
        { headers: { "User-Agent": "AetherAI/1.0" }, timeout: 5000 }
      );
      const snippets = searchRes.data.query?.search?.map(r => r.snippet.replace(/<[^>]+>/g, "")) || [];
      return snippets.join(" ");
    } catch {
      return "";
    }
  }
}

// Step 2: PLAN — Create a content outline with language + tone support
function planScript(topic, research, style, duration, numScenes, language = "English", tone = "Informative") {
  const languageInstruction = language !== "English"
    ? `IMPORTANT: Write ALL narration text in ${language}. The voiceover will be in ${language}.`
    : "Write narration in English.";

  const toneMap = {
    Informative: "educational, clear, and factual",
    Serious:     "serious, authoritative, and impactful",
    Funny:       "humorous, witty, and light-hearted with jokes or wordplay",
    Dramatic:    "dramatic, suspenseful, and emotionally intense",
    Inspirational: "uplifting, motivating, and emotionally inspiring",
  };
  const toneDescription = toneMap[tone] || "engaging and informative";

  return `You are an expert short-form video creator and an AI scriptwriter agent.

TASK: Create a ${duration}-second TikTok/Shorts video with EXACTLY ${numScenes} scenes about: "${topic}"
STYLE: ${style}
TONE: ${tone} — Write in a ${toneDescription} voice.

${languageInstruction}

RESEARCH CONTEXT (use these real facts to make the script accurate and engaging):
"""
${research || "No specific research found. Use your general knowledge."}
"""

CRITICAL RULES FOR A CONTINUOUS STORY:
1. The script must be ONE CONTINUOUS, UNBROKEN NARRATIVE. It should read like a single flowing essay or voiceover, not a list of separate facts.
2. DO NOT use disjointed transitions like "Here is another fact" or "Scene 2". The end of one scene's narration should flow perfectly into the beginning of the next.
3. NEVER start a sentence with the topic name twice in a row. Use pronouns (he/she/it/they) or transition words.
4. Each scene represents a visual change, NOT a break in the audio story.

FORMATTING INSTRUCTIONS:
- Break the continuous story smoothly across EXACTLY ${numScenes} scenes.
- Each scene should have 1-2 flowing sentences of narration in ${language}.
- Create highly distinct, specific image keywords IN ENGLISH for each scene to match the visual setting.
- YOUR RESPONSE MUST BE A PURE JSON ARRAY. NO MARKDOWN, NO EXPLANATIONS.

Return ONLY a valid JSON array with exactly ${numScenes} elements. Each element:
- "narration": continuous voiceover in ${language} (flows perfectly from the previous scene, ${tone} tone)
- "imageDescription": specific visual IN ENGLISH (e.g., "A dense futuristic city at night")
- "imageKeywords": 2-3 search terms IN ENGLISH (e.g., "cyberpunk city,neon")
- "duration": seconds for this scene (around 5-8 seconds)

Example of a CONTINUOUS, FLOWING script broken into scenes:
[{"narration":"A single lightning bolt packs enough energy to toast 100,000 slices of bread!","imageDescription":"A massive lightning strike hitting a mountain peak","imageKeywords":"lightning strike,storm","duration":6},{"narration":"That immense power superheats the surrounding air instantly, causing it to explode outward.","imageDescription":"Slow motion shockwave in the sky","imageKeywords":"shockwave,sky explosion","duration":5},{"narration":"The resulting sound wave is what we hear as thunder, echoing across the landscape long after the flash is gone.","imageDescription":"Dark storm clouds rolling over a vast valley","imageKeywords":"storm clouds,dark valley","duration":7}]

Return ONLY the JSON array.`;
}

// Step 3: FETCH IMAGES — Get real photos from free APIs
export async function fetchSceneImage(keywords, fallbackDescription) {
  const searchTerm = (keywords?.split(",")[0]?.trim() || fallbackDescription || "nature").replace(/[^a-zA-Z0-9 ]/g, "");

  if (process.env.PEXELS_API_KEY) {
    try {
      const res = await axios.get(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=portrait`,
        { headers: { Authorization: process.env.PEXELS_API_KEY }, timeout: 5000 }
      );
      if (res.data.photos?.[0]) return res.data.photos[0].src.large;
    } catch { /* fall through */ }
  }

  if (process.env.PIXABAY_API_KEY) {
    try {
      const res = await axios.get(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&orientation=vertical&per_page=3`,
        { timeout: 5000 }
      );
      if (res.data.hits?.[0]) return res.data.hits[0].largeImageURL;
    } catch { /* fall through */ }
  }

  return `https://picsum.photos/seed/${encodeURIComponent(searchTerm)}/600/900`;
}

// Generate a Gemini-powered thumbnail keyword then fetch the image
export async function generateThumbnailUrl(topic, scenes) {
  // Use first scene image or ask Gemini for a better thumbnail query
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Given a short-form video about "${topic}", suggest the single most visually compelling search query (2-4 words, English only) to find a high-impact YouTube thumbnail photo. Reply with ONLY the search query, nothing else.`
    );
    const keywords = result.response.text().trim().replace(/[^a-zA-Z0-9 ]/g, "");
    console.log(`🖼️ Gemini thumbnail keywords: "${keywords}"`);
    return await fetchSceneImage(keywords, topic);
  } catch (err) {
    console.warn("Gemini thumbnail fallback:", err.message);
    // Fallback: use first scene image
    return scenes?.[0]?.imageUrl || null;
  }
}

// Main RAG Agent function — with language & tone
export async function ragGenerateScenes(topic, style, duration, llmCall, language = "English", tone = "Informative") {
  const numScenes = Math.max(3, Math.floor(parseInt(duration) / 10));

  console.log("🔍 RAG Agent: Researching topic...");
  const research = await researchTopic(topic);
  console.log(`📚 RAG Agent: Found ${research.length} chars of research context`);

  console.log(`📝 RAG Agent: Writing script [lang:${language}, tone:${tone}]...`);
  const prompt = planScript(topic, research, style, duration, numScenes, language, tone);
  const rawResponse = await llmCall(prompt);

  let scenes;
  try {
    const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
    scenes = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
  } catch {
    const sentences = rawResponse.split(/[.!?]+/).filter(s => s.trim());
    scenes = sentences.slice(0, numScenes).map((s) => ({
      narration: s.trim(),
      imageDescription: `Visual about ${topic}`,
      imageKeywords: topic,
      duration: Math.floor(parseInt(duration) / numScenes),
    }));
  }

  // Ensure we have at least exactly numScenes for a complete video
  while (scenes.length < numScenes) {
    scenes.push({
      narration: "...",
      imageDescription: `Visual about ${topic}`,
      imageKeywords: topic,
      duration: Math.floor(parseInt(duration) / numScenes) || 5,
    });
  }

  console.log("🖼️ RAG Agent: Fetching images for scenes...");
  const enrichedScenes = await Promise.all(
    scenes.map(async (scene, i) => {
      const imageUrl = await fetchSceneImage(
        scene.imageKeywords || topic,
        scene.imageDescription || topic
      );
      return { ...scene, imageUrl, background: GRADIENTS[i % GRADIENTS.length] };
    })
  );

  console.log(`✅ RAG Agent: Generated ${enrichedScenes.length} scenes`);
  return { scenes: enrichedScenes, research };
}

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];
