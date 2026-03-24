import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";
import VideoActions from "@/components/VideoActions";

export default async function VideoDetailPage({ params }) {
  const { userId } = await auth();
  const { id } = await params;

  // Fetch video details from backend API
  const response = await fetch(getApiUrl(`/api/videos/${id}`), {
    cache: 'no-store',
    headers: { 'Authorization': `Bearer ${userId}` }
  });

  if (!response.ok) {
    if (response.status === 404) notFound();
    throw new Error("Failed to fetch video details");
  }

  const video = await response.json();
  const relatedVideos = []; // For now simplified

  const scenes = video.scenes || [];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard" className="btn btn-outline" suppressHydrationWarning>
          ← Back to Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Language + Tone badges */}
          {video.language && video.language !== "English" && (
            <span className="badge" style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
              🌍 {video.language}
            </span>
          )}
          {video.tone && (
            <span className="badge" style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", background: "rgba(245,158,11,0.12)", color: "#fbbf24" }}>
              🎭 {video.tone}
            </span>
          )}
          <span
            className="badge"
            style={{
              padding: "0.5rem 1rem", fontSize: "0.85rem",
              background: video.status === "COMPLETED" ? "rgba(0,255,100,0.15)" : "rgba(255,200,0,0.15)",
              color: video.status === "COMPLETED" ? "#00ff64" : "#ffc800",
            }}
          >
            {video.status}
          </span>
        </div>
      </div>

      {/* Title + AI Thumbnail */}
      <div className="glass-panel" style={{ padding: 0, marginBottom: "2rem", overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
        {video.thumbnailUrl && (
          <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
            <img
              src={video.thumbnailUrl}
              alt="AI Thumbnail"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)",
            }} />
            <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{video.topic}</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                Created on {new Date(video.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                {" · "}{scenes.length} scenes
              </p>
            </div>
          </div>
        )}
        {!video.thumbnailUrl && (
          <div style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{video.topic}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Created on {new Date(video.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              {" · "}{scenes.length} scenes
            </p>
          </div>
        )}
      </div>

      {/* Script actions row */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <VideoActions script={video.script} topic={video.topic} />
      </div>

      <div className="grid grid-cols-2" style={{ gap: "2rem" }}>
        {/* Video Player */}
        <div>
          <h3 style={{ marginBottom: "1rem", color: "var(--accent)" }}>🎬 Video Preview</h3>
          {scenes.length > 0 ? (
            <VideoPlayer scenes={scenes} audioUrl={video.audioUrl} language={video.language || "English"} />
          ) : (
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>
                No scenes were generated for this video.
              </p>
            </div>
          )}
        </div>

        {/* Script & Scenes Board */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: "600" }}>📝 Storyboard</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "0.3rem 0.8rem", borderRadius: "20px" }}>
              {scenes.length} Total Scenes
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {scenes.length > 0 ? scenes.map((scene, i) => (
              <div key={i} className="glass-panel storyboard-card" style={{ 
                padding: "1rem", 
                display: "grid", gridTemplateColumns: "120px 1fr", gap: "1.5rem", alignItems: "start",
                transition: "all 0.2s ease"
              }}>
                {/* Scene Image Thumbnail */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", borderRadius: "var(--radius-md)", overflow: "hidden", background: scene.background || "rgba(255,255,255,0.05)" }}>
                  {scene.imageUrl ? (
                    <img src={scene.imageUrl} alt={`Scene ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)" }}>
                      Generating...
                    </div>
                  )}
                  {/* Scene Number Badge Inside Image */}
                  <div style={{ position: "absolute", top: "0.4rem", left: "0.4rem", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: "0.1rem 0.6rem", borderRadius: "10px", fontSize: "0.65rem", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.1)" }}>
                    #{i + 1}
                  </div>
                  {/* Duration Badge Bottom Right */}
                  <div style={{ position: "absolute", bottom: "0.4rem", right: "0.4rem", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: "0.1rem 0.5rem", borderRadius: "10px", fontSize: "0.6rem", color: "var(--accent)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {scene.duration}s
                  </div>
                </div>

                {/* Scene Content */}
                <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
                  <p style={{ 
                    marginBottom: "0.75rem", lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500",
                    display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>
                    "{scene.narration}"
                  </p>
                  
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.02)" }}>
                    <span style={{ fontSize: "0.85rem" }}>🖼️</span>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontStyle: "italic", lineHeight: "1.4" }}>
                      {scene.imageDescription}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="glass-panel" style={{
                padding: "2rem", textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)",
                lineHeight: 1.8, fontSize: "0.95rem", color: "var(--text-secondary)",
              }}>
                {video.script ? (
                  <div style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>{video.script}</div>
                ) : (
                  <div>No scenes available. The script may still be generating.</div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--glass-border)" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>📹 More Videos by You</h3>
          <div className="grid grid-cols-3" style={{ gap: "1.5rem" }}>
            {relatedVideos.map((rv) => {
              const rvScenes = rv.scenes || [];
              const thumbUrl = rv.thumbnailUrl || rvScenes[0]?.imageUrl || null;
              const thumbBg = rvScenes[0]?.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

              return (
                <Link key={rv.id} href={`/dashboard/video/${rv.id}`} 
                      className="glass-panel" 
                      style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit" }}>
                  <div style={{ height: "120px", background: thumbBg, position: "relative", overflow: "hidden" }}>
                    {thumbUrl && (
                      <img src={thumbUrl} alt={rv.topic} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <span style={{ position: "absolute", bottom: "0.5rem", right: "0.5rem", background: "rgba(0,0,0,0.7)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold" }}>
                      {rvScenes.length} scenes
                    </span>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rv.topic}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {new Date(rv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
