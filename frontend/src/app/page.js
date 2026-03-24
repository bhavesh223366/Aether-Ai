import Link from "next/link";
import { auth } from '@clerk/nextjs/server';

export default async function LandingPage() {
  const { userId } = await auth();

  const dashHref = userId ? "/dashboard" : "/sign-in";
  const dashText = userId ? "Go to Dashboard" : "Start Creating for Free";
  const ctaHref = userId ? "/dashboard" : "/sign-in";

  return (
    <main style={{ minHeight: "100vh" }} suppressHydrationWarning>
      {/* Hero Section */}
      <section suppressHydrationWarning className="container flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ minHeight: "90vh", paddingTop: "6rem", paddingBottom: "4rem" }}>
        <div className="badge">✨ Generative AI Video Creation</div>
        
        <h1 style={{ fontSize: "clamp(3rem, 8vw, 5rem)", marginBottom: "1.5rem", maxWidth: "900px", lineHeight: "1.1" }}>
          Create Viral Shorts with <br />
          <span className="text-gradient">Artificial Intelligence</span>
        </h1>
        
        <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", marginBottom: "3rem", maxWidth: "600px" }}>
          Turn your text prompts into engaging, high-retention videos for YouTube Shorts, TikTok, and Instagram Reels in seconds. Automated scripts, voiceovers, and captions.
        </p>

        <div className="flex gap-4 justify-center" style={{ flexWrap: "wrap" }} suppressHydrationWarning>
          <Link href={dashHref} className="btn btn-primary" style={{ fontSize: "1.125rem", padding: "1rem 2.5rem" }} suppressHydrationWarning>
            {dashText}
          </Link>
          <a href="#how-it-works" className="btn btn-outline" style={{ fontSize: "1.125rem", padding: "1rem 2.5rem" }} suppressHydrationWarning>
            See How it Works
          </a>
        </div>

        <div style={{ marginTop: "4rem", display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          <div className="flex" style={{ paddingLeft: "0.5rem" }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${i*40}, 70%, 50%)`, border: "2px solid black", marginLeft: "-0.5rem" }}></div>
            ))}
          </div>
          <span>Join 10,000+ creators building viral audiences</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container animate-fade-in-up delay-200" style={{ padding: "6rem 2rem" }}>
        <div className="text-center" style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Everything you need to go viral</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>We handle the complex video production so you can focus on building your audience.</p>
        </div>

        <div className="grid grid-cols-3">
          <div className="glass-panel">
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📝</div>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>AI Script Writing</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>Provide a topic, URL, or idea and our specialized AI model will write an engaging script optimized for retention.</p>
          </div>
          <div className="glass-panel">
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🗣️</div>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>Hyper-Realistic Voices</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>Generate voiceovers using industry-leading AI models that mimic natural human pacing, breathing, and emotion.</p>
          </div>
          <div className="glass-panel">
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎨</div>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>Dynamic Visuals</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>Automatically generated B-roll and animations synced perfectly with your audio to retain viewer attention.</p>
          </div>
          <div className="glass-panel">
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔤</div>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>Trending Captions</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>Animated, colorful captions styled like top creators (e.g. Hormozi) added automatically to your video.</p>
          </div>
          <div className="glass-panel">
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚡</div>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>Lightning Fast</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>Render a complete 60-second video in under 3 minutes, ready to export and post to your platforms.</p>
          </div>
          <div className="glass-panel">
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📱</div>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>Auto-Scheduling</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>Connect your TikTok, Instagram, and YouTube accounts to automatically schedule and post your content.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ background: "var(--bg-secondary)", padding: "8rem 0" }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: "5rem" }}>
            <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>How Aether Works</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>Three simple steps to automate your content pipeline.</p>
          </div>

          <div className="flex flex-col gap-6" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div className="glass-panel flex items-center gap-6" style={{ padding: "2.5rem" }}>
              <div style={{ fontSize: "4rem", fontWeight: "800", color: "var(--primary)", opacity: 0.5, lineHeight: 1 }}>1</div>
              <div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Provide a Prompt</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Tell our AI what you want a video about. You can be as specific or as broad as you like.</p>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-6" style={{ padding: "2.5rem" }}>
              <div style={{ fontSize: "4rem", fontWeight: "800", color: "var(--secondary)", opacity: 0.5, lineHeight: 1 }}>2</div>
              <div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Review & Customize</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Aether generates a full script and suggests voice styles. Tweak the script if needed, or just hit proceed.</p>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-6" style={{ padding: "2.5rem" }}>
              <div style={{ fontSize: "4rem", fontWeight: "800", color: "var(--accent)", opacity: 0.5, lineHeight: 1 }}>3</div>
              <div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Render & Publish</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Within minutes, your fully finished video is ready to download or publish directly to your socials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container text-center" style={{ padding: "8rem 2rem", position: "relative" }}>
        <div className="glow-circle" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, rgba(0, 0, 0, 0) 70%)" }}></div>
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
          Ready to dominate <br /> short-form content?
        </h2>
        <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem", position: "relative", zIndex: 1 }}>
          Join thousands of creators who are scaling their reach without spending hours on editing.
        </p>
        <Link href={ctaHref} className="btn btn-primary" style={{ fontSize: "1.25rem", padding: "1.25rem 3rem", position: "relative", zIndex: 1 }} suppressHydrationWarning>
          Create Your First Video Now
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--glass-border)", padding: "4rem 0", background: "var(--bg-color)" }}>
        <div className="container flex justify-between items-center" style={{ flexWrap: "wrap", gap: "2rem", padding: "4rem 2rem" }}>
          <div>
            <div className="logo text-gradient" style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "1rem" }}>
              AETHER AI
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "300px" }}>
              The ultimate AI video generator for creators, marketers, and brands.
            </p>
          </div>
          
          <div className="flex gap-6" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }} suppressHydrationWarning>Terms</Link>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }} suppressHydrationWarning>Privacy</Link>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }} suppressHydrationWarning>Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
