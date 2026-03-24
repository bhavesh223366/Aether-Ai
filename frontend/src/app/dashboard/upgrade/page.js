import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getApiUrl } from "@/lib/api";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "10 credits",
    color: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    accent: "var(--text-secondary)",
    features: [
      "10 AI video generations",
      "Up to 30 sec videos",
      "5 languages",
      "Basic tones",
      "Script export",
    ],
    cta: "Current Plan",
    ctaDisabled: true,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    credits: "100 credits / mo",
    color: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.4)",
    accent: "var(--accent)",
    badge: "⭐ Most Popular",
    features: [
      "100 AI video generations",
      "Up to 90 sec videos",
      "All 9 languages",
      "All 5 tones + Mood AI",
      "Gemini AI thumbnails",
      "Priority generation",
      "ElevenLabs voiceovers",
    ],
    cta: "Upgrade to Pro",
    ctaDisabled: false,
  },
  {
    name: "Creator",
    price: "$29",
    period: "/ month",
    credits: "Unlimited credits",
    color: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.35)",
    accent: "#fbbf24",
    features: [
      "Unlimited AI videos",
      "Up to 3 min videos",
      "All languages + dialects",
      "Custom voice cloning",
      "YouTube auto-upload",
      "Scheduled posting",
      "Priority support",
    ],
    cta: "Go Creator",
    ctaDisabled: false,
  },
];

export default async function UpgradePage() {
  const { userId } = await auth();
  let credits = 20; // Default or fetch from backend
  try {
    const res = await fetch(getApiUrl("/api/videos"), {
      headers: { 'Authorization': `Bearer ${userId}` }
    });
    // For now using static 20 or we could add a user endpoint
    credits = 20; 
  } catch { /* backend unreachable */ }

  return (
    <div className="animate-fade-in-up">
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐ Choose Your Plan</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          You currently have <strong style={{ color: "var(--accent)" }}>{credits} credits</strong> remaining.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", maxWidth: "960px", margin: "0 auto" }}>
        {TIERS.map((tier) => (
          <div key={tier.name} style={{
            background: tier.color,
            border: `1px solid ${tier.border}`,
            borderRadius: "var(--radius-lg)",
            padding: "2rem 1.5rem",
            display: "flex", flexDirection: "column", gap: "1.5rem",
            position: "relative", overflow: "hidden",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}>
            {tier.badge && (
              <div style={{
                position: "absolute", top: "1rem", right: "1rem",
                background: "rgba(124,58,237,0.25)", color: "#c4b5fd",
                borderRadius: "1rem", padding: "0.2rem 0.7rem", fontSize: "0.75rem",
                border: "1px solid rgba(124,58,237,0.3)",
              }}>
                {tier.badge}
              </div>
            )}

            <div>
              <h3 style={{ color: tier.accent, marginBottom: "0.5rem" }}>{tier.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "white" }}>{tier.price}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{tier.period}</span>
              </div>
              <div style={{
                marginTop: "0.5rem", fontSize: "0.8rem", fontWeight: 600,
                color: tier.accent, background: `${tier.border}55`, borderRadius: "1rem",
                padding: "0.25rem 0.75rem", display: "inline-block",
              }}>
                {tier.credits}
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
              {tier.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <span style={{ color: tier.accent, flexShrink: 0, marginTop: "0.1rem" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled={tier.ctaDisabled}
              className={tier.ctaDisabled ? "btn btn-outline" : "btn btn-primary"}
              style={{
                width: "100%", padding: "0.85rem",
                opacity: tier.ctaDisabled ? 0.5 : 1,
                cursor: tier.ctaDisabled ? "default" : "pointer",
                fontSize: "0.95rem",
              }}
            >
              {tier.ctaDisabled ? tier.cta : `${tier.cta} →`}
              {!tier.ctaDisabled && (
                <span style={{ display: "block", fontSize: "0.7rem", opacity: 0.7, marginTop: "0.15rem" }}>
                  Coming soon — payment integration
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "2.5rem" }}>
        💳 Secure payments via Stripe · Cancel anytime · No hidden fees
      </p>
    </div>
  );
}
