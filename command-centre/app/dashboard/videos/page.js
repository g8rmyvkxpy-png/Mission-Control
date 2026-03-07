'use client';

import { useState, useEffect } from 'react';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      let url = '/api/videos';
      const params = [];
      if (filterAgent) params.push(`agent_id=${filterAgent}`);
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const res = await fetch(url);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    }
    setLoading(false);
  }

  async function deleteVideo(id) {
    if (!confirm('Delete this video?')) return;
    await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
    fetchVideos();
    setSelectedVideo(null);
  }

  const agentColors = {
    Neo: '#10b981',
    Atlas: '#3b82f6',
    Orbit: '#f59e0b'
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Demo Videos</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Every completed task recorded automatically
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterAgent}
          onChange={(e) => { setFilterAgent(e.target.value); fetchVideos(); }}
        >
          <option value="">All Agents</option>
          <option value="0fd5605b-42d7-4095-8219-b5515678aecb">Neo</option>
          <option value="c13d73a1-9bb2-4256-8e7b-95324a9d0f8d">Atlas</option>
          <option value="6b7f3467-52da-4361-a8fb-b78eb0a64c33">Orbit</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); fetchVideos(); }}
        >
          <option value="">All Status</option>
          <option value="ready">Ready</option>
          <option value="failed">Failed</option>
          <option value="recording">Recording</option>
        </select>

        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="card empty" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
          <p style={{ color: 'var(--text-secondary)' }}>No videos yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Videos will appear when agents complete tasks
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {videos.map(video => (
            <div
              key={video.id}
              className="card"
              style={{ cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail / Placeholder */}
              <div style={{ 
                height: 140, 
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12
              }}>
                <span style={{ fontSize: 48 }}>🎥</span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {video.title}
              </h3>

              {/* Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: agentColors[video.agent?.name] || '#6b7280', fontWeight: 500 }}>
                  {video.agent?.name || 'Unknown'}
                </span>
                <span style={{ 
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  background: video.status === 'ready' ? '#10b981' : 
                             video.status === 'failed' ? '#ef4444' : '#f59e0b',
                  color: '#fff'
                }}>
                  {video.status}
                </span>
              </div>

              {/* Date */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                {new Date(video.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>{selectedVideo.title}</h2>
              <button onClick={() => setSelectedVideo(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Video Player Placeholder */}
            <div style={{ 
              height: 400, 
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 64 }}>🎬</span>
                <p style={{ color: '#fff', marginTop: 12 }}>
                  {selectedVideo.status === 'ready' 
                    ? 'Video player would play: ' + (selectedVideo.file_path || '').split('/').pop()
                    : selectedVideo.status === 'recording'
                    ? 'Video is still processing...'
                    : 'Video recording failed'}
                </p>
              </div>
            </div>

            {/* Agent Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 500, color: agentColors[selectedVideo.agent?.name] || '#6b7280' }}>
                  {selectedVideo.agent?.name || 'Unknown Agent'}
                </span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 12, fontSize: 13 }}>
                  {new Date(selectedVideo.created_at).toLocaleString()}
                </span>
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={() => deleteVideo(selectedVideo.id)}
                style={{ background: '#ef4444', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
