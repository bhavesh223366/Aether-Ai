import Link from "next/link";
import { auth } from '@clerk/nextjs/server';
import { getApiUrl } from "@/lib/api";
import AnalyticsChart from "@/components/AnalyticsChart";

export default async function DashboardPage() {
  const { userId } = await auth();

  // Fetch data from backend API
  const response = await fetch(getApiUrl(`/api/videos`), {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${userId}`, // Using userId as a simple token for dev
    }
  });
  
  const videos = await response.json();
  
  const profileRes = await fetch(getApiUrl("/api/profile"), {
    cache: 'no-store',
    headers: { 'Authorization': `Bearer ${userId}` }
  });
  const user = await profileRes.json();

  return (
    <div className="animate-fade-in-up" suppressHydrationWarning>
      {/* Cosmic Hero Header */}
      <div className="glass-panel" style={{
        marginBottom: "3rem",
        padding: "3.5rem 2.5rem",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", overflow: "hidden"
      }} suppressHydrationWarning>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "var(--primary)", filter: "blur(120px)", opacity: 0.15 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "0.5rem", letterSpacing: "-1.5px" }}>
            Welcome to <span className="text-gradient">Aether Studio</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px" }}>
            The next generation of AI content production. Manage and view your generated AI Shorts, TikToks, and Personas.
          </p>
        </div>
        <Link suppressHydrationWarning href="/dashboard/create-new" 
              className="btn btn-primary" 
              style={{ padding: "1.2rem 2rem", fontSize: "1rem", borderRadius: "50px", fontWeight: "700", position: "relative", zIndex: 1 }}>
          ✨ FORGE NEW CONTENT
        </Link>
      </div>

      {/* Analytics Stats Row */}
      <div className="grid grid-cols-3" style={{ gap: "1.5rem", marginBottom: "3rem" }} suppressHydrationWarning>
        <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #6366f1", display: "flex", flexDirection: "column", justifyContent: "center" }} suppressHydrationWarning>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Total Videos
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }} suppressHydrationWarning>{videos.length}</span>
            <span style={{ color: "#34d399", fontSize: "0.85rem", fontWeight: "600" }}>+1 this week</span>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #f59e0b", display: "flex", flexDirection: "column", justifyContent: "center" }} suppressHydrationWarning>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Scenes Generated
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }} suppressHydrationWarning>
              {videos.reduce((acc, v) => acc + (v.scenes?.length || 0), 0)}
            </span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>total scenes</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #10b981", display: "flex", flexDirection: "column", justifyContent: "center" }} suppressHydrationWarning>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Credits Available
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }} suppressHydrationWarning>{user?.credits || 0}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>credits</span>
          </div>
        </div>
      </div>

      <AnalyticsChart videos={videos} />

      {videos.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No videos yet</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            You haven't generated any videos. Start creating now!
          </p>
          <Link suppressHydrationWarning href="/dashboard/create-new" className="btn btn-primary">
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: "2rem" }}>
          {videos.map((video) => {
            const scenes = video.scenes || [];
            const thumbUrl = video.thumbnailUrl || scenes[0]?.imageUrl || null;
            const thumbBg = scenes[0]?.background || "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)";

            return (
              <div key={video.id} className="glass-panel group video-card-hover"
                style={{
                  padding: 0, overflow: "hidden", display: "flex", flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "pointer",
                }}
              >
                {/* Vertical Thumbnail for Shorts/TikTok vibe */}
                <div style={{ position: "relative", aspectRatio: "4/5", background: thumbBg, overflow: "hidden" }}>
                  {thumbUrl && (
                    <img
                      suppressHydrationWarning
                      src={thumbUrl}
                      alt={video.topic}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                      className="group-hover:scale-105"
                    />
                  )}
                  {/* Subtle Gradient Overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)",
                  }} />

                  {/* Top Badges */}
                  <div style={{ position: "absolute", top: "0.8rem", left: "0.8rem", right: "0.8rem", display: "flex", justifyContent: "space-between" }}>
                    <span style={{
                      background: video.status === "COMPLETED" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: video.status === "COMPLETED" ? "#34d399" : "#fbbf24",
                      border: `1px solid ${video.status === "COMPLETED" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                      borderRadius: "2rem", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: 600, backdropFilter: "blur(4px)"
                    }}>
                      {video.status}
                    </span>
                    
                    {video.language && video.language !== "English" && (
                      <span style={{
                        background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "2rem", padding: "0.2rem 0.6rem", fontSize: "0.7rem", backdropFilter: "blur(4px)"
                      }}>
                        🌍 {video.language.substring(0,3).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Info */}
                  <div style={{ position: "absolute", bottom: "0.8rem", left: "0.8rem", right: "0.8rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff", lineHeight: 1.3, marginBottom: "0.3rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {video.topic}
                    </h3>
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <span suppressHydrationWarning>📅 {new Date(video.createdAt).toLocaleDateString()}</span>
                    <span>🖼️ {scenes.length} Scenes</span>
                  </div>
                  
                  <Link suppressHydrationWarning href={`/dashboard/video/${video.id}`}
                    className="btn btn-outline"
                    style={{ width: "100%", textAlign: "center", padding: "0.6rem", borderRadius: "var(--radius-sm)" }}>
                    Open Studio →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global CSS for the server-rendered video cards */}
      <style>{`
        .video-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(79, 70, 229, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
