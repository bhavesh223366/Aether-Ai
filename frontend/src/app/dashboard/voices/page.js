"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getApiUrl } from "@/lib/api";

export default function VoicesPage() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState("voice");
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("Rachel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [lyrics, setLyrics] = useState("");

  const handleGenerateVoice = async () => {
    if (!text.trim()) return alert("Please enter some text");
    
    setIsGenerating(true);
    try {
      const res = await fetch(getApiUrl("/api/generate-audio"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({ text, voice })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResults([{
        id: data.audioId,
        text: text.slice(0, 30) + "...",
        voice,
        url: data.audioUrl,
        date: "Just now"
      }, ...results]);
      
      setText(""); // Clear input
      alert(`Success! Generated with ${voice}. 1 credit deducted.`);
    } catch (err) {
      alert(err.message || "Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMusic = () => {
    alert("AI Music Generation is a Pro feature currently in experimental beta. Real music processing will be available soon!");
  };

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>Audio Studio</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Generate hyper-realistic AI voices or create custom AI music tracks.
          </p>
        </div>
        
        {/* Tab Toggle */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", padding: "0.3rem", borderRadius: "50px", border: "1px solid var(--glass-border)" }}>
          <button 
            suppressHydrationWarning
            onClick={() => setActiveTab("voice")}
            style={{ 
              padding: "0.6rem 1.2rem", borderRadius: "50px", fontSize: "0.9rem", fontWeight: "600", transition: "all 0.2s",
              background: activeTab === "voice" ? "var(--primary)" : "transparent",
              color: activeTab === "voice" ? "white" : "var(--text-secondary)",
              boxShadow: activeTab === "voice" ? "0 4px 15px rgba(79, 70, 229, 0.4)" : "none"
            }}>
            🎙️ Text to Speech
          </button>
          <button 
            suppressHydrationWarning
            onClick={() => setActiveTab("music")}
            style={{ 
              padding: "0.6rem 1.2rem", borderRadius: "50px", fontSize: "0.9rem", fontWeight: "600", transition: "all 0.2s",
              background: activeTab === "music" ? "#db2777" : "transparent",
              color: activeTab === "music" ? "white" : "var(--text-secondary)",
              boxShadow: activeTab === "music" ? "0 4px 15px rgba(219, 39, 119, 0.4)" : "none"
            }}>
            🎵 AI Music Generator
          </button>
        </div>
      </div>

      {activeTab === "voice" ? (
        <div className="grid grid-cols-2" style={{ gap: "2rem" }}>
          {/* Voice Input Section */}
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Generate Speech</h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                Select AI Voice Actor
              </label>
              <select 
                suppressHydrationWarning
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="glass-panel" 
                style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)", color: "white", borderRadius: "var(--radius-sm)", outline: "none" }}>
                <option value="Rachel">Rachel (American, Calm)</option>
                <option value="Antoni">Antoni (American, Deep)</option>
                <option value="Bella">Bella (Soft, Friendly)</option>
                <option value="Josh">Josh (Natural, Deep)</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                Script Content
              </label>
              <textarea 
                suppressHydrationWarning
                className="glass-panel" 
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste the text you want the AI to speak..."
                style={{ width: "100%", padding: "1rem", background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)", color: "white", borderRadius: "var(--radius-sm)", resize: "none", outline: "none" }}
              />
            </div>

            <button 
              suppressHydrationWarning
              onClick={handleGenerateVoice}
              disabled={isGenerating}
              className="btn btn-primary" 
              style={{ width: "100%", padding: "0.8rem", justifyContent: "center", opacity: isGenerating ? 0.6 : 1 }}>
              {isGenerating ? "Processing..." : "Generate Audio (1 Credit)"}
            </button>
          </div>

          {/* Voices Output/Library Section */}
          <div className="glass-panel" style={{ padding: "2rem", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem" }}>Recent Generations</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {results.length > 0 ? results.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <audio src={item.url} controls style={{ height: "35px", width: "150px" }} />
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "0.95rem" }}>{item.text}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.voice} • {item.date}</p>
                    </div>
                  </div>
                  <a suppressHydrationWarning href={item.url} download className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Download</a>
                </div>
              )) : (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
                  Your generated audio files will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: "2rem" }}>
          {/* Music Input Section */}
          <div className="glass-panel" style={{ padding: "2rem", borderTop: "4px solid #db2777" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Create AI Song</h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                Music Genre / Style
              </label>
              <input 
                suppressHydrationWarning
                type="text" 
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                placeholder="e.g. Lofi Hip Hop, Synthwave, Epic Orchestral..."
                style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)", color: "white", borderRadius: "var(--radius-sm)", outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                Lyrics or Topic (Optional)
              </label>
              <textarea 
                suppressHydrationWarning
                className="glass-panel" 
                rows={5}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Enter custom lyrics, or just describe what the song should convey..."
                style={{ width: "100%", padding: "1rem", background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)", color: "white", borderRadius: "var(--radius-sm)", resize: "none", outline: "none" }}
              />
            </div>

            <button 
              suppressHydrationWarning
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic}
              className="btn btn-primary" 
              style={{ width: "100%", padding: "0.8rem", justifyContent: "center", background: "#db2777", boxShadow: "0 4px 15px rgba(219, 39, 119, 0.4)", opacity: isGeneratingMusic ? 0.6 : 1 }}>
              {isGeneratingMusic ? "Generating Anthem..." : "Generate Song (2 Credits)"}
            </button>
          </div>

          {/* Music Output Section */}
          <div className="glass-panel" style={{ padding: "2rem", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem", filter: "grayscale(0.5)", opacity: 0.5 }}>🎧</div>
            <h3 style={{ marginBottom: "0.5rem", color: "var(--text-secondary)" }}>No songs generated yet</h3>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", maxWidth: "300px" }}>
              Your generated AI music tracks will appear here. Turn your scripts into viral anthems.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
