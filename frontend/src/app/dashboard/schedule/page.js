import Link from 'next/link';

export default function SchedulePage() {
  return (
    <div style={{ padding: '1rem' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Content Scheduler</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Connect your accounts and automate your posting.</p>
        </div>
        <Link href="/dashboard" className="btn btn-primary">
          + Create Video
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '4rem' }}>
        {/* Social Connections */}
        <div className="glass-panel text-center">
          <div style={{ fontSize: '3rem', margin: '1rem 0', color: '#ff0000' }}>▶️</div>
          <h3 style={{ marginBottom: '1rem' }}>YouTube Shorts</h3>
          <button className="btn btn-outline" style={{ width: '100%' }}>Connect Account</button>
        </div>
        <div className="glass-panel text-center">
          <div style={{ fontSize: '3rem', margin: '1rem 0', color: '#E1306C' }}>📸</div>
          <h3 style={{ marginBottom: '1rem' }}>Instagram Reels</h3>
          <button className="btn btn-outline" style={{ width: '100%' }}>Connect Account</button>
        </div>
        <div className="glass-panel text-center">
          <div style={{ fontSize: '3rem', margin: '1rem 0', color: '#00F2FE' }}>🎵</div>
          <h3 style={{ marginBottom: '1rem' }}>TikTok</h3>
          <button className="btn btn-outline" style={{ width: '100%' }}>Connect Account</button>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upcoming Posts</h2>
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ minHeight: '200px', borderStyle: 'dashed' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No videos scheduled yet.</p>
          <Link href="/dashboard" className="btn btn-outline">
            Generate your first video
          </Link>
        </div>
      </div>
    </div>
  );
}
