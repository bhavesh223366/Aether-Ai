import Link from "next/link";
import { auth } from '@clerk/nextjs/server';
import { getApiUrl } from "@/lib/api";

export default async function DashboardLayout({ children }) {
  await auth.protect();
  const { userId } = await auth();

  // Fetch user data/credits from backend API
  let credits = 20;
  try {
    const res = await fetch(getApiUrl("/api/profile"), {
      cache: 'no-store',
      headers: { 'Authorization': `Bearer ${userId}` }
    });
    const profile = await res.json();
    credits = profile.credits !== undefined ? profile.credits : 20;
  } catch (err) {
    console.warn("[DashboardLayout] Could not reach backend:", err.message);
  }

  return (
    <div className="min-h-screen relative" suppressHydrationWarning style={{ background: "radial-gradient(circle at top right, rgba(139, 92, 246, 0.05), transparent 400px), radial-gradient(circle at bottom left, rgba(34, 211, 238, 0.05), transparent 400px)" }}>
      <div className="container flex flex-col gap-8" suppressHydrationWarning style={{ marginTop: "1.5rem", paddingBottom: "4rem" }}>
        {/* Aero Horizontal Nav */}
        <nav className="glass-panel" suppressHydrationWarning style={{ 
          padding: "0.6rem 1.2rem", 
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderRadius: "100px", 
          position: "sticky", top: "1.5rem", zIndex: 100,
          background: "rgba(10, 10, 30, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <Link suppressHydrationWarning href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div suppressHydrationWarning style={{ width: "32px", height: "32px", background: "linear-gradient(45deg, var(--primary), var(--accent))", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "white", fontSize: "1.2rem", boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)" }}>A</div>
              <span suppressHydrationWarning style={{ fontWeight: "800", fontSize: "1.2rem", letterSpacing: "-1px", background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AETHER AI</span>
            </Link>

            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <Link suppressHydrationWarning href="/dashboard" className="nav-link">Studio</Link>
              <Link suppressHydrationWarning href="/dashboard/library" className="nav-link">Library</Link>
              <Link suppressHydrationWarning href="/dashboard/voices" className="nav-link">Vocalist</Link>
              <Link suppressHydrationWarning href="/dashboard/avatars" className="nav-link">Persona</Link>
              <Link suppressHydrationWarning href="/dashboard/upgrade" className="nav-link" style={{ color: "var(--accent)" }}>Elite</Link>
              <Link suppressHydrationWarning href="/dashboard/settings" className="nav-link">Portal</Link>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div className="badge" style={{ margin: 0, padding: "0.4rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "50px", fontSize: "0.8rem" }}>
              <span style={{ opacity: 0.6, marginRight: "0.4rem" }}>BALANCE:</span>
              <span style={{ color: "var(--accent)", fontWeight: "700" }}>{credits}</span>
            </div>
            <Link suppressHydrationWarning href="/dashboard/create-new" className="btn btn-primary" style={{ padding: "0.6rem 1.4rem", fontSize: "0.85rem", borderRadius: "50px", fontWeight: "700", letterSpacing: "0.5px" }}>
              CREATE +
            </Link>
          </div>
        </nav>

        <style>{`
          .nav-link {
            padding: 0.5rem 1rem;
            border-radius: 50px;
            color: rgba(255,255,255,0.6);
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.3s;
            text-decoration: none;
            position: relative;
          }
          .nav-link:hover {
            color: white;
            background: rgba(255,255,255,0.05);
          }
          .nav-link::after {
            content: "";
            position: absolute;
            bottom: 0; left: 50%; transform: translateX(-50%);
            width: 0; height: 2px; background: var(--primary);
            transition: width 0.3s;
            border-radius: 2px;
            box-shadow: 0 0 10px var(--primary);
          }
          .nav-link:hover::after {
            width: 20px;
          }
        `}</style>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
