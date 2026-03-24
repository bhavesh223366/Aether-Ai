"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function VideoPlayer({ scenes, audioUrl, language = "English" }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const isPlayingRef = useRef(false);

  const scene = scenes[currentScene];
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 5), 0);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // BCP-47 tags for supported languages
  const LANG_BCP47 = {
    English: "en-US", Spanish: "es-ES", Hindi: "hi-IN",
    French: "fr-FR", German: "de-DE", Portuguese: "pt-BR",
    Italian: "it-IT", Japanese: "ja-JP", Korean: "ko-KR",
    Chinese: "zh-CN", Arabic: "ar-SA", Russian: "ru-RU",
  };
  const langTag = LANG_BCP47[language] || "en-US";

  // Best available voice for the video's language
  const getBestVoice = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const isEnglish = langTag.startsWith("en");

    // For non-English: prefer a voice matching the exact locale, then any voice for that language
    if (!isEnglish) {
      const exact = voices.find(v => v.lang === langTag);
      if (exact) return exact;
      const langPrefix = langTag.split("-")[0];
      const partial = voices.find(v => v.lang.startsWith(langPrefix));
      if (partial) return partial;
      // If no matching voice, fall through to English (still sets utterance.lang below)
    }

    // English priority list (original logic)
    const priorities = [
      v => v.name.includes("Google UK English Female"),
      v => v.name.includes("Google US English"),
      v => v.name.includes("Microsoft") && v.lang.startsWith("en") && v.name.includes("Online"),
      v => v.name.includes("Samantha"),
      v => v.lang.startsWith("en-GB"),
      v => v.lang.startsWith("en-US"),
      v => v.lang.startsWith("en"),
    ];
    for (const check of priorities) {
      const found = voices.find(check);
      if (found) return found;
    }
    return voices[0] || null;
  }, [langTag]);

  // Speak narration for a single scene (browser TTS fallback)
  const speakScene = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis || audioUrl) return;
    // Removed stopSpeech() here so utterances queue naturally for a continuous story
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langTag;   // ← tells the TTS engine which phoneme model to use
    utterance.rate = 0.9;       // slightly slower for non-Latin scripts
    utterance.pitch = 1.0;
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;
    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setCaption(text.substring(0, e.charIndex + e.charLength));
      }
    };
    window.speechSynthesis.speak(utterance);
  }, [getBestVoice, audioUrl, langTag]);

  // Main continuous playback loop — timer-based, auto-advances all scenes
  const startContinuousPlayback = useCallback(() => {
    isPlayingRef.current = true;
    startTimeRef.current = Date.now();

    // Play ElevenLabs audio if available
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Calculate scene start times
    const sceneStarts = [];
    let cumulative = 0;
    scenes.forEach((s) => {
      sceneStarts.push(cumulative);
      cumulative += (s.duration || 5);
    });

    // Animation frame loop: sync scene index + progress bar + captions
    const tick = () => {
      if (!isPlayingRef.current) return;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      
      // If we have real audio, and its metadata is loaded, use its true duration
      let activeTotal = totalDuration;
      if (audioUrl && audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        activeTotal = audioRef.current.duration;
      }

      const pct = Math.min((elapsed / activeTotal) * 100, 100);
      setProgress(pct);

      // Determine which scene we're in
      let activeScene = 0;
      for (let i = sceneStarts.length - 1; i >= 0; i--) {
        if (elapsed >= sceneStarts[i]) {
          activeScene = i;
          break;
        }
      }

      setCurrentScene((prev) => {
        if (prev !== activeScene) {
          // Scene changed — trigger new narration & caption
          setCaption("");
          setImageLoaded(false);
          if (!audioUrl) {
            // Use browser TTS for this scene (it queues naturally)
            setTimeout(() => speakScene(scenes[activeScene].narration), 50);
          } else {
            // With ElevenLabs audio, show full caption
            setCaption(scenes[activeScene].narration);
          }
        }
        return activeScene;
      });

      // Video finished
      if (elapsed >= activeTotal) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setProgress(100);
        
        // Let browser TTS queue finish naturally, only pause ElevenLabs audio
        if (audioUrl && audioRef.current) {
          audioRef.current.pause();
        }
        return;
      }

      progressRef.current = requestAnimationFrame(tick);
    };

    // Kick off first scene narration
    if (!audioUrl) {
      speakScene(scenes[0].narration);
    } else {
      setCaption(scenes[0].narration);
    }

    progressRef.current = requestAnimationFrame(tick);
  }, [scenes, audioUrl, totalDuration, speakScene, stopSpeech]);

  const handlePlay = () => {
    if (isPlaying) {
      // Pause
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopSpeech();
      if (audioRef.current) audioRef.current.pause();
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
      return;
    }
    // Play from beginning
    setIsPlaying(true);
    setCurrentScene(0);
    setProgress(0);
    setCaption("");
    startContinuousPlayback();
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => {
      isPlayingRef.current = false;
      stopSpeech();
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, [stopSpeech]);

  if (!scenes || scenes.length === 0) {
    return <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>No scenes available.</div>;
  }

  return (
    <div className="glass-panel" style={{ padding: 0, overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
      {/* Video Canvas */}
      <div
        style={{
          aspectRatio: "9/16",
          maxHeight: "600px",
          width: "100%",
          background: scene?.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
          overflow: "hidden",
          transition: "background 0.6s ease",
        }}
      >
        {/* Scene Image */}
        {scene?.imageUrl && (
          <img
            key={scene.imageUrl}
            src={scene.imageUrl}
            alt={scene.imageDescription}
            onLoad={() => setImageLoaded(true)}
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
              animation: isPlaying ? "kenBurns 8s ease-in-out infinite alternate" : "none",
            }}
          />
        )}

        {/* Dark overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 100%)",
          zIndex: 1,
        }} />

        {/* Scene Badge */}
        <div style={{
          position: "absolute", top: "0.8rem", left: "0.8rem", zIndex: 2,
          background: "rgba(0,0,0,0.6)", borderRadius: "2rem", backdropFilter: "blur(10px)",
          padding: "0.25rem 0.7rem", fontSize: "0.7rem", color: "#fff",
          display: "flex", alignItems: "center", gap: "0.3rem",
        }}>
          <span style={{ color: isPlaying ? "#00ff64" : "var(--accent)" }}>●</span>
          Scene {currentScene + 1} / {scenes.length}
        </div>

        {/* RAG Badge */}
        <div style={{
          position: "absolute", top: "0.8rem", right: "0.8rem", zIndex: 2,
          background: "rgba(124,58,237,0.25)", borderRadius: "2rem", backdropFilter: "blur(10px)",
          padding: "0.25rem 0.7rem", fontSize: "0.65rem", color: "#c4b5fd",
          border: "1px solid rgba(124,58,237,0.2)",
        }}>
          🤖 RAG + AI
        </div>

        {/* Image Description (when not playing) */}
        {!isPlaying && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", zIndex: 2,
            textAlign: "center", padding: "1.5rem", maxWidth: "85%",
          }}>
            <div style={{
              fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", fontStyle: "italic",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}>
              🎬 {scene?.imageDescription}
            </div>
          </div>
        )}

        {/* Captions — TikTok/Reels Style */}
        {caption && isPlaying && (
          <div style={{
            position: "absolute", bottom: "3rem", left: "5%", right: "5%",
            zIndex: 3, textAlign: "center",
          }}>
            <p style={{
              display: "inline",
              fontSize: "1.3rem",
              fontWeight: 800,
              color: "#FFFFFF",
              textShadow: "0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8), 0 0 30px rgba(124,58,237,0.4)",
              lineHeight: 1.6,
              letterSpacing: "0.01em",
              WebkitTextStroke: "0.3px rgba(0,0,0,0.3)",
              background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
              padding: "0.5rem 1rem",
              borderRadius: "0.75rem",
              wordBreak: "break-word",
            }}>
              {caption}
            </p>
          </div>
        )}

        {/* Scene transition segments */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "4px",
          display: "flex", gap: "2px", zIndex: 3, padding: "0 2px",
        }}>
          {scenes.map((s, i) => {
            const sceneProgress = i < currentScene ? 100 : i === currentScene ?
              Math.min((progress - scenes.slice(0, i).reduce((sum, sc) => sum + ((sc.duration || 5) / totalDuration * 100), 0)) /
              ((s.duration || 5) / totalDuration * 100) * 100, 100) : 0;
            return (
              <div key={i} style={{
                flex: s.duration || 5,
                background: "rgba(255,255,255,0.15)",
                borderRadius: "2px",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.max(0, sceneProgress)}%`,
                  background: "white",
                  transition: "width 0.3s linear",
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: "0.8rem 1.2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)",
      }}>
        <button onClick={handlePlay} className="btn btn-primary"
          style={{ padding: "0.6rem 1.5rem", fontSize: "0.9rem" }}>
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => { if (!isPlaying) setCurrentScene(Math.max(0, currentScene - 1)); }}>
            ⏮
          </button>
          <button className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => { if (!isPlaying) setCurrentScene(Math.min(scenes.length - 1, currentScene + 1)); }}>
            ⏭
          </button>
        </div>

        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
          {Math.round(progress / 100 * totalDuration)}s / {totalDuration}s
        </span>
      </div>

      {/* Ken Burns CSS Animation */}
      <style jsx>{`
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }
      `}</style>
    </div>
  );
}
