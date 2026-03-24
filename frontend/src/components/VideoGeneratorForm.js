'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getApiUrl } from '@/lib/api';

export default function VideoGeneratorForm() {
  const { userId } = useAuth();
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [duration, setDuration] = useState('30s');
  const [voice, setVoice] = useState('Matthew');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic || !userId) return alert("Please sign in to generate videos.");
    
    setLoading(true);
    setVideoUrl(null);
    setStatus('Generating AI Script...');
    
    try {
      // 1. Script
      const scriptRes = await fetch(getApiUrl('/api/generate-script'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({ topic, style, duration, voice })
      });
      
      setStatus('Generating Text-to-Speech...');
      // 2. Audio (Mock wait)
      await new Promise(r => setTimeout(r, 1500));
      
      setStatus('Generating AI Images...');
      // 3. Images (Mock wait)
      await new Promise(r => setTimeout(r, 2000));
      
      setStatus('Assembling Video...');
      // 4. Assembly (Mock wait)
      await new Promise(r => setTimeout(r, 2000));
      
      setVideoUrl('/videos/demo-output.mp4'); // A dummy success preview
      setStatus('Completed!');
    } catch (error) {
      console.error(error);
      setStatus('Failed to generate video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2" style={{ gap: '3rem' }}>
      {/* Form Section */}
      <form onSubmit={handleGenerate} className="flex flex-col gap-6">
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Video Topic or Prompt</label>
          <textarea 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. 5 hidden history facts about Ancient Rome..."
            className="glass-panel"
            style={{ 
              width: '100%', 
              minHeight: '120px', 
              color: '#fff', 
              fontSize: '1rem',
              resize: 'vertical'
            }}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Visual Style</label>
            <select 
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
              className="glass-panel"
              style={{ width: '100%', padding: '0.75rem 1rem', color: '#fff' }}
            >
              <option value="Realistic">Realistic / Cinematic</option>
              <option value="Cartoon">Cartoon / Anime</option>
              <option value="Watercolor">Watercolor</option>
              <option value="Cyberpunk">Cyberpunk</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Duration</label>
            <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="glass-panel"
              style={{ width: '100%', padding: '0.75rem 1rem', color: '#fff' }}
            >
              <option value="15s">15 Seconds</option>
              <option value="30s">30 Seconds</option>
              <option value="60s">60 Seconds</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>AI Voiceover</label>
          <select 
            value={voice} 
            onChange={(e) => setVoice(e.target.value)}
            className="glass-panel"
            style={{ width: '100%', padding: '0.75rem 1rem', color: '#fff' }}
          >
            <option value="Matthew">🎙️ Matthew (Deep Male)</option>
            <option value="Sarah">🎙️ Sarah (Energetic Female)</option>
            <option value="Antoni">🎙️ Antoni (Storyteller)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading || !topic} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="spinner"></span> {status}
            </span>
          ) : (
            '✨ Generate Video'
          )}
        </button>
      </form>

      {/* Preview Section */}
      <div>
        <VideoPreview videoUrl={videoUrl} loading={loading} status={status} />
      </div>

      <style jsx>{`
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        select option {
          background-color: var(--bg-color);
          color: white;
        }
      `}</style>
    </div>
  );
}
