"use client"; 


import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

const LANGUAGES = ["English", "Spanish", "Hindi", "French", "German", "Portuguese", "Italian", "Japanese", "Korean"];
const TONES = ["Informative", "Serious", "Funny", "Dramatic", "Inspirational"];
const VOICES = ["Rachel", "Matthew", "Antoni", "Bella", "Josh"];
const STYLES = ["realistic", "cartoon", "cinematic", "watercolor"];
const DURATIONS = [
  { value: "10", label: "10 Seconds" },
  { value: "15", label: "15 Seconds" },
  { value: "20", label: "20 Seconds" },
  { value: "30", label: "30 Seconds" },
  { value: "45", label: "45 Seconds" },
  { value: "60", label: "60 Seconds (1 min)" },
  { value: "90", label: "90 Seconds (1.5 min)" },
];

const STEP_LABELS = ["Research", "Script", "Images"];

function ProgressBar({ steps, current }) {
  return (
    <div style={{ margin: "1.5rem 0" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {steps.map((label, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: "4px", borderRadius: "2px",
              background: i < current ? "var(--accent)" : i === current ? "var(--accent)" : "rgba(255,255,255,0.1)",
              transition: "background 0.4s",
              position: "relative", overflow: "hidden",
            }}>
              {i === current && (
                <div style={{
                  position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  animation: "shimmer 1.2s infinite",
                }} />
              )}
            </div>
            <div style={{
              fontSize: "0.7rem", marginTop: "0.3rem", textAlign: "center",
              color: i <= current ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: i === current ? 700 : 400,
            }}>
              {i < current ? "✓ " : ""}{label}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes shimmer { to { left: 100%; } }
      `}</style>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        suppressHydrationWarning
        style={{
          width: "100%", padding: "0.85rem 1rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(0,0,0,0.25)", border: "1px solid var(--glass-border)",
          color: "white", cursor: "pointer",
        }}
      >
        {options.map(opt => (
          <option key={typeof opt === "string" ? opt : opt.value} value={typeof opt === "string" ? opt : opt.value}>
            {typeof opt === "string" ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CreateNewPage() {
  const { userId } = useAuth();
  const router = useRouter();

  // Form state
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("realistic");
  const [duration, setDuration] = useState("30");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Informative");
  const [voice, setVoice] = useState("Rachel");

  // UI state
  const [step, setStep] = useState(1); // 1 = form, 2 = scene editor
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // which progress bar step is active
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [regeneratingIndex, setRegeneratingIndex] = useState(null); // Which scene's image is being swapped

  // Scene editor state
  const [scenes, setScenes] = useState([]);

  // runWithProgress: sets loading state, delegates progress updates to fn(),
  // and catches any errors to display inline instead of crashing React.
  const runWithProgress = async (fn) => {
    setLoading(true);
    setError("");
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Preview scenes (free)
  const handlePreview = useCallback(async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    await runWithProgress(async () => {
      setLoadingStep(0); setStatusMsg("Researching topic...");
      const res = await fetch(getApiUrl("/api/generate-script"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({ topic, style, duration, language, tone }),
      });

      setLoadingStep(1); setStatusMsg("Writing AI script...");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Preview failed");
      }

      setLoadingStep(2); setStatusMsg("Building scene editor...");
      const data = await res.json();
      setScenes(data.scenes || []);
      setStep(2);
    });
  }, [topic, style, duration, language, tone, userId]);

  // Regenerate script (from scene editor step)
  const handleRegenerate = useCallback(async () => {
    await runWithProgress(async () => {
      setLoadingStep(0); setStatusMsg("Regenerating script...");
      const res = await fetch(getApiUrl("/api/generate-script"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({ topic, style, duration, language, tone }),
      });
      setLoadingStep(1); setStatusMsg("Fetching new images...");
      if (!res.ok) throw new Error("Regeneration failed");
      const data = await res.json();
      setScenes(data.scenes || []);
    });
  }, [topic, style, duration, language, tone, userId]);

  // Step 2: Confirm & Generate (costs 1 credit)
  const handleGenerate = useCallback(async () => {
    await runWithProgress(async () => {
      setLoadingStep(0); setStatusMsg("Saving video...");
      const res = await fetch(getApiUrl("/api/generate"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({ topic, style, duration, language, tone, voice, scenes }),
      });

      setLoadingStep(1); setStatusMsg("Generating voiceover...");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setLoadingStep(2); setStatusMsg("Done! Redirecting...");
      router.push(`/dashboard/video/${data.videoId}`);
    });
  }, [topic, style, duration, language, tone, voice, scenes, router, userId]);

  // Regenerate a single scene image (free)
  const handleRegenerateSceneImage = async (index) => {
    const scene = scenes[index];
    if (!scene) return;

    setRegeneratingIndex(index);
    try {
      const res = await fetch(getApiUrl("/api/generate-scene-image"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({ 
          keywords: scene.imageKeywords || topic, 
          description: scene.imageDescription || topic 
        }),
      });

      if (!res.ok) throw new Error("Image regeneration failed");
      const data = await res.json();
      
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, imageUrl: data.imageUrl } : s));
    } catch (err) {
      alert(err.message);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const updateNarration = (index, value) => {
    setScenes(prev => prev.map((s, i) => i === index ? { ...s, narration: value } : s));
  };

  return (
    <div className="animate-fade-in-up">
      <h2 style={{ marginBottom: "0.5rem" }}>
        {step === 1 ? "Create New Video" : "✏️ Edit Your Scenes"}
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>
        {step === 1
          ? "Fill in the details below. Preview is free — credits only deducted on final generation."
          : "Review and edit each scene's narration, then confirm to generate your video."}
      </p>

      {error && (
        <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1.5rem", borderLeft: "3px solid #f87171", color: "#f87171" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── STEP 1: FORM ── */}
      {step === 1 && (
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <form onSubmit={handlePreview} className="flex flex-col gap-6" suppressHydrationWarning>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Video Topic or Prompt
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required
                rows={4}
                suppressHydrationWarning
                placeholder="E.g. A 30 second educational short about the history of Rome..."
                style={{
                  width: "100%", padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)",
                  color: "white", fontFamily: "inherit", resize: "vertical",
                }}
              />
            </div>

            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <SelectField label="Visual Style" value={style} onChange={setStyle}
                options={STYLES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
              <SelectField label="Duration" value={duration} onChange={setDuration} options={DURATIONS} />
            </div>

            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <SelectField label="🌍 Language" value={language} onChange={setLanguage} options={LANGUAGES} />
              <SelectField label="🎭 Tone / Mood" value={tone} onChange={setTone} options={TONES} />
            </div>

            <div className="grid grid-cols-2" style={{ gap: "1rem" }}>
              <SelectField label="🎙️ AI Voice" value={voice} onChange={setVoice} options={VOICES} />
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div className="glass-panel" style={{ width: "100%", padding: "0.85rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  💡 Preview is <strong style={{ color: "white" }}>free</strong>. 1 credit used on final generation only.
                </div>
              </div>
            </div>

            {loading && <ProgressBar steps={STEP_LABELS} current={loadingStep} />}

            <button
              suppressHydrationWarning
              type="submit"
              disabled={loading || !topic.trim()}
              className="btn btn-primary"
              style={{ padding: "1rem 3rem", fontSize: "1rem", alignSelf: "flex-end" }}
            >
              {loading ? `⏳ ${statusMsg}` : "🔍 Preview Scenes (Free)"}
            </button>
          </form>
        </div>
      )}

      {/* ── STEP 2: SCENE EDITOR ── */}
      {step === 2 && (
        <div className="animate-fade-in-up">
          {/* Storyboard Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "3rem" }}>
            {scenes.map((scene, i) => (
              <div key={i} className="glass-panel" 
                style={{ 
                  padding: "1.5rem", 
                  display: "grid", 
                  gridTemplateColumns: "240px 1fr", 
                  gap: "2rem", 
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--glass-border)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                
                {/* Visual Preview Side */}
                <div style={{ position: "relative" }}>
                  <div style={{ 
                    borderRadius: "12px", 
                    overflow: "hidden", 
                    aspectRatio: "16/9", 
                    background: scene.background || "#222", 
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                    {scene.imageUrl ? (
                      <img src={scene.imageUrl} alt={scene.imageDescription}
                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: regeneratingIndex === i ? 0.3 : 1, transition: "opacity 0.3s" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "2rem", opacity: 0.2 }}>🎬</span>
                      </div>
                    )}
                    
                    {/* Regenerate Action - Overlay on Hover */}
                    <div style={{ 
                      position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.4)", opacity: regeneratingIndex === i ? 1 : 0, transition: "opacity 0.2s",
                      pointerEvents: regeneratingIndex === i ? "none" : "auto"
                    }} className="group-hover:opacity-100">
                      <button 
                        onClick={() => handleRegenerateSceneImage(i)}
                        disabled={regeneratingIndex !== null}
                        style={{ 
                          background: "var(--primary)", color: "white", padding: "0.5rem 1rem", 
                          borderRadius: "50px", fontSize: "0.75rem", fontWeight: 700, border: "none",
                          cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                        }}>
                        {regeneratingIndex === i ? "🔄 Swapping..." : "🖼️ Swap Image"}
                      </button>
                    </div>
                  </div>
                  
                  {/* Badge Row */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <span style={{ 
                      background: "rgba(79, 70, 229, 0.2)", color: "#a5b4fc", 
                      padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 
                    }}>
                      SCENE {i + 1}
                    </span>
                    <span style={{ 
                      background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", 
                      padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem" 
                    }}>
                      ⏱️ {scene.duration}s
                    </span>
                  </div>
                </div>

                {/* Content Editing Side */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem", fontWeight: 700 }}>
                      Script & Narration
                    </label>
                    <textarea
                      value={scene.narration}
                      onChange={e => updateNarration(i, e.target.value)}
                      rows={4}
                      style={{
                        width: "100%", padding: "1rem",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)",
                        color: "white", fontFamily: "inherit", resize: "none", fontSize: "1rem", lineHeight: "1.6",
                        outline: "none", transition: "border 0.2s"
                      }}
                      onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    />
                  </div>
                  
                  <div style={{ 
                    padding: "0.8rem 1rem", background: "rgba(255,255,255,0.03)", 
                    borderRadius: "8px", border: "1px dotted rgba(255,255,255,0.1)",
                    fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "0.6rem"
                  }}>
                    <span style={{ opacity: 0.6 }}>🖼️</span>
                    <span style={{ fontStyle: "italic", lineHeight: 1.4 }}>{scene.imageDescription}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ 
            position: "sticky", bottom: "1rem", zIndex: 10,
            padding: "1.25rem 2rem", background: "rgba(10,10,20,0.8)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: "var(--radius-lg)",
            display: "flex", gap: "1.5rem", justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.5)"
          }}>
            <button
              onClick={() => setStep(1)}
              className="btn btn-outline"
              disabled={loading}
              style={{ padding: "0.8rem 1.5rem", borderRadius: "50px" }}
            >
              ← Edit Topic
            </button>

            <div style={{ display: "flex", gap: "1rem", flex: 1, justifyContent: "flex-end" }}>
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="btn btn-outline"
                style={{ padding: "0.8rem 1.5rem", borderRadius: "50px", borderColor: "rgba(255,255,255,0.2)" }}
              >
                {loading && statusMsg.includes("Regen") ? "⏳ Processing..." : "🔄 Regenerate All"}
              </button>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: "0.8rem 2.5rem", fontSize: "1rem", borderRadius: "50px", fontWeight: "700", boxShadow: "0 4px 20px rgba(79, 70, 229, 0.4)" }}
              >
                {loading && !statusMsg.includes("Regen") ? `⏳ ${statusMsg}` : "⚡ Generate Full Video (1 Credit)"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        select option { background-color: #1a1a2e; color: white; }
      `}</style>
    </div>
  );
}
