export default function BrandKitPage() {
  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Brand Kit</h1>
        <p style={{ color: "var(--text-secondary)" }}>Set your default colors, fonts, and watermarks for your videos.</p>
      </div>

      <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎨</div>
        <h3 style={{ marginBottom: "0.5rem" }}>Pro Feature</h3>
        <p style={{ color: "var(--text-secondary)" }}>
          Brand Kits will be available for Pro and Creator tier users shortly!
        </p>
      </div>
    </div>
  );
}
