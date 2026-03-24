"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

const PRESET_AVATARS = [
  { id: "lily", name: "Lily", role: "Corporate / Formal", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=400&fit=crop" },
  { id: "ethan", name: "Ethan", role: "Casual / Tech", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=400&fit=crop" },
  { id: "maya", name: "Maya", role: "Friendly / Support", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=400&fit=crop" },
  { id: "marcus", name: "Marcus", role: "Authoritative", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&h=400&fit=crop" },
  { id: "custom", name: "Your Face", role: "Upload Photo", url: "" },
];

export default function AvatarStudioPage() {
  const { userId } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let interval;
    if (isGenerating && generationId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(getApiUrl(`/api/avatar-status/${generationId}`), {
            headers: { "Authorization": `Bearer ${userId}` }
          });
          const data = await res.json();
          if (data.status === "done") {
            setVideoUrl(data.videoUrl);
            setIsGenerating(false);
            setStatus("done");
            clearInterval(interval);
          } else if (data.status === "error") {
            alert("Generation failed. Please try again.");
            setIsGenerating(false);
            setStatus("error");
            clearInterval(interval);
          } else {
            setStatus("processing");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, generationId]);

  const handleGenerate = async () => {
    if (!script.trim()) return alert("Please enter a script");
    if (selectedAvatar.id === 'custom' && !selectedAvatar.url) return alert("Please provide an image URL for your custom avatar");
    
    setIsGenerating(true);
    setStatus("created");
    try {
      const res = await fetch(getApiUrl("/api/generate-avatar"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({ imageUrl: selectedAvatar.url, script })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGenerationId(data.id);
    } catch (err) {
      alert(err.message || "Failed to start generation");
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: "800", marginBottom: "0.5rem", letterSpacing: "-1px", background: "linear-gradient(to right, #fff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Avatar Studio
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          Animate professional AI avatars or your own photos into high-fidelity talking heads.
        </p>
      </div>

      <div className="grid grid-cols-12" style={{ gap: "2rem" }}>
        {/* Selection Side */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Choose Your Persona</h3>
              <span style={{ fontSize: "0.75rem", background: "rgba(79, 70, 229, 0.2)", padding: "0.3rem 0.8rem", borderRadius: "20px", color: "#a5b4fc", fontWeight: "600" }}>
                STEP 1
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5" style={{ gap: "1rem" }}>
              {PRESET_AVATARS.map((avatar) => (
                <div 
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className="group"
                  style={{
                    cursor: "pointer",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "rgba(0,0,0,0.3)",
                    border: `2px solid ${selectedAvatar.id === avatar.id ? "var(--primary)" : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    transform: selectedAvatar.id === avatar.id ? "scale(1.02)" : "scale(1)",
                    boxShadow: selectedAvatar.id === avatar.id ? "0 0 20px rgba(79, 70, 229, 0.3)" : "none"
                  }}
                >
                  <div style={{ width: "100%", aspectRatio: "3.5/4.5", display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatar.id === 'custom' ? 'rgba(79, 70, 229, 0.05)' : 'none' }}>
                    {avatar.id === 'custom' && !avatar.url ? (
                      <div style={{ textAlign: 'center', opacity: 0.6 }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>📸</div>
                        <p style={{ fontSize: '0.65rem', fontWeight: 600 }}>PASTE URL</p>
                      </div>
                    ) : (
                      <img suppressHydrationWarning src={avatar.url} alt={avatar.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="group-hover:scale-110" />
                    )}
                  </div>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, 
                    padding: "0.6rem", background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                    fontSize: "0.75rem", textAlign: "center"
                  }}>
                    <p style={{ fontWeight: 700, color: "white" }}>{avatar.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.6rem" }}>{avatar.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedAvatar.id === 'custom' && (
              <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(79, 70, 229, 0.03)', border: '1px dashed rgba(79, 70, 229, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Custom Portrait Mode</p>
                </div>
                <input 
                  suppressHydrationWarning
                  type="text"
                  placeholder="Paste any publicly accessible image URL (PNG/JPG)..."
                  onChange={(e) => setSelectedAvatar({ ...selectedAvatar, url: e.target.value })}
                  style={{ width: '100%', padding: '0.9rem 1.2rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', fontSize: '0.9rem', outline: "none", transition: "border 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: "2rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Compose Script</h3>
              <span style={{ fontSize: "0.75rem", background: "rgba(79, 70, 229, 0.2)", padding: "0.3rem 0.8rem", borderRadius: "20px", color: "#a5b4fc", fontWeight: "600" }}>
                STEP 2
              </span>
            </div>
            <textarea 
              suppressHydrationWarning
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Provide the words your avatar will speak. Tips: Use punctuation for natural pauses!"
              rows={8}
              style={{
                width: "100%", padding: "1.5rem", background: "rgba(0,0,0,0.3)", 
                border: "1px solid rgba(255,255,255,0.1)", color: "white", 
                borderRadius: "12px", outline: "none", fontSize: "1.05rem", lineHeight: "1.6",
                transition: "all 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
        </div>

        {/* Right Preview Side */}
        <div className="col-span-12 lg:col-span-4">
          <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", background: "linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(0,0,0,0.2))", border: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "160px", height: "160px", margin: "0 auto 1.5rem", 
                borderRadius: "50%", overflow: "hidden", border: "4px solid rgba(79, 70, 229, 0.2)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
              }}>
                {selectedAvatar.url ? (
                  <img suppressHydrationWarning src={selectedAvatar.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ background: "#222", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>👤</div>
                )}
              </div>
              <h4 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.2rem" }}>Studio Monitor</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{selectedAvatar.name}</p>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {isGenerating ? (
                <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="loader-container" style={{ margin: "0 auto 1.5rem" }}>
                    <div className="loader"></div>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    {status === 'processing' ? 'Processing Lip-Sync...' : 'Uploading Asset...'}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Synthesizing speech and facial movement.</p>
                </div>
              ) : videoUrl ? (
                <div style={{ textAlign: "center" }}>
                  <video suppressHydrationWarning src={videoUrl} controls autoPlay style={{ width: "100%", borderRadius: "16px", marginBottom: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    <a suppressHydrationWarning href={videoUrl} download className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "1rem" }}>
                      Download 4K Video
                    </a>
                    <button suppressHydrationWarning onClick={() => {setVideoUrl(null); setStatus(null);}} className="btn btn-outline" style={{ width: "100%", justifyContent: "center", padding: "1rem" }}>
                      Reset Studio
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  suppressHydrationWarning
                  onClick={handleGenerate}
                  disabled={isGenerating || !script.trim()}
                  className="btn btn-primary" 
                  style={{ width: "100%", padding: "1.2rem", justifyContent: "center", fontSize: "1.1rem", fontWeight: "700", opacity: !script.trim() ? 0.5 : 1 }}
                >
                  🚀 Start Avatar Conversion
                </button>
              )}
            </div>

            <div style={{ 
              background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.15)", 
              padding: "1.2rem", borderRadius: "12px", fontSize: "0.85rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#a5b4fc", fontWeight: "700", marginBottom: "0.4rem" }}>
                <span>✨</span> STUDIO GUIDELINES
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Conversion costs <strong>5 credits</strong>. For best results, ensure your image and script match the avatar's persona.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .loader-container {
          position: relative;
          width: 60px;
          height: 60px;
        }
        .loader {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 60px;
          height: 60px;
          border: 4px solid var(--primary);
          border-radius: 50%;
          animation: loader 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: var(--primary) transparent transparent transparent;
        }
        @keyframes loader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
