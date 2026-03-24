import Link from "next/link";
import { auth } from '@clerk/nextjs/server';
import { getApiUrl } from "@/lib/api";

export default async function LibraryPage() {
  const { userId } = await auth();

  // Fetch data from backend API
  const response = await fetch(getApiUrl(`/api/videos`), {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${userId}`,
    }
  });
  const videos = await response.json();
  const user = { credits: 20 }; // Placeholder

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>Library</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Access and manage all your generated scripts, scenes, and videos.
          </p>
        </div>
        
        {/* Fake search bar for UI polish */}
        <div style={{ position: "relative", width: "300px" }}>
          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search library..." 
            disabled
            style={{ 
              width: "100%", padding: "0.8rem 1rem 0.8rem 2.8rem", 
              borderRadius: "50px", background: "rgba(0,0,0,0.3)", 
              border: "1px solid var(--glass-border)", color: "white", outline: "none",
              fontSize: "0.9rem"
            }} 
          />
        </div>
      </div>

      {/* Analytics Stats Row */}
      <div className="grid grid-cols-3" style={{ gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #6366f1", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Total Videos
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }}>{videos.length}</span>
            <span style={{ color: "#34d399", fontSize: "0.85rem", fontWeight: "600" }}>+1 this week</span>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #f59e0b", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Scenes Generated
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }}>
              {videos.reduce((acc, v) => acc + (v.scenes?.length || 0), 0)}
            </span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>total scenes</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #10b981", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Credits Available
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-1px" }}>{user?.credits || 0}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>credits</span>
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ marginBottom: "0.5rem" }}>Your library is empty</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            You haven't generated any videos yet.
          </p>
          <Link suppressHydrationWarning href="/dashboard/create-new" className="btn btn-primary">
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
              <tr>
                <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "500" }}>Video</th>
                <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "500" }}>Created</th>
                <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "500" }}>Topic</th>
                <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "500" }}>Status</th>
                <th style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)", fontWeight: "500", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => {
                const scenes = video.scenes || [];
                const thumbUrl = video.thumbnailUrl || scenes[0]?.imageUrl || null;
                const thumbBg = scenes[0]?.background || "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)";

                return (
                  <tr key={video.id} className="table-row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "1rem 1.5rem", width: "120px" }}>
                      <div style={{ width: "80px", aspectRatio: "16/9", borderRadius: "var(--radius-sm)", background: thumbBg, overflow: "hidden" }}>
                        {thumbUrl && <img src={thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "var(--text-secondary)" }}>
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", maxWidth: "300px" }}>
                      <div style={{ fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {video.topic}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        {scenes.length} Scenes • {video.language || "English"}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{
                        background: video.status === "COMPLETED" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: video.status === "COMPLETED" ? "#34d399" : "#fbbf24",
                        borderRadius: "20px", padding: "0.3rem 0.8rem", fontSize: "0.75rem", fontWeight: "600"
                      }}>
                        {video.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <Link suppressHydrationWarning href={`/dashboard/video/${video.id}`} className="btn btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Global CSS for table hover rows */}
      <style>{`
        .table-row-hover {
          transition: background 0.2s;
        }
        .table-row-hover:hover {
          background: rgba(255,255,255,0.03);
        }
      `}</style>
    </div>
  );
}
