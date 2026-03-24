'use client';

export default function VideoPreview({ videoUrl, loading, status }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <label style={{ display: 'block', fontWeight: '500' }}>Preview & Export</label>
      
      <div 
        className="glass-panel flex items-center justify-center" 
        style={{ 
          flex: 1, 
          minHeight: '400px', 
          borderRadius: 'var(--radius-lg)', 
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="loading-pulse" style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '50%' }}></div>
            <p className="text-gradient" style={{ fontWeight: '600', fontSize: '1.2rem' }}>{status}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This usually takes about 60 seconds.</p>
          </div>
        ) : videoUrl ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {/* Mock Video Player */}
               <div style={{ color: '#fff', fontSize: '1.5rem' }}>▶️ Ready to Play</div>
            </div>
            <button className="btn btn-primary" style={{ margin: '1rem' }}>
              ⬇️ Download / Schedule
            </button>
          </div>
        ) : (
          <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📱</div>
            <p>Your generated video will appear here.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .loading-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
