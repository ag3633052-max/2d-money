import { useEffect, useState } from 'react';

function pretty(n) {
  if (n > 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n > 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function rankFromFollowers(n) {
  if (n > 250000) return ['Iconic', 'legendary'][Math.floor(Math.random()*2)];
  if (n > 50000) return 'Influencer';
  if (n > 5000) return 'Rising Star';
  if (n > 500) return 'Local';
  return 'Seedling';
}

export default function SocialPanel({ youtube, facebook, privacyMode }) {
  const key = 'social_panel_counts_v1';
  const [counts, setCounts] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved && !privacyMode) return JSON.parse(saved);
    } catch (e) {}
    return {
      youtube: 48200,
      facebook: 13400
    };
  });

  useEffect(() => {
    if (!privacyMode) {
      try { localStorage.setItem(key, JSON.stringify(counts)); } catch (e) {}
    }
  }, [counts, privacyMode]);

  const total = (counts.youtube || 0) + (counts.facebook || 0);
  const socialRank = rankFromFollowers(total);

  const amplify = (which) => {
    setCounts(prev => {
      const delta = Math.floor((Math.random() * 0.12 + 0.04) * (prev[which] || 1000));
      const next = { ...prev, [which]: Math.max(0, (prev[which] || 0) + delta) };
      return next;
    });
  };

  const panelStyle = {
    padding: '10px 12px',
    background: 'linear-gradient(180deg,#071022, #0b1220)',
    color: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(148,163,184,0.08)',
    width: 260,
    fontSize: '0.85rem'
  };

  const linkStyle = { color: '#60a5fa', textDecoration: 'none', fontWeight: 600 };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800 }}>Social Showcase</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{socialRank.toUpperCase()}</div>
      </div>

      <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <a href={youtube} target="_blank" rel="noopener noreferrer" style={linkStyle}>YouTube</a>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{pretty(counts.youtube)} subscribers</div>
          </div>
          <div>
            <button onClick={() => amplify('youtube')} style={{ background: '#ff0000', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 8 }}>Amplify</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <a href={facebook} target="_blank" rel="noopener noreferrer" style={linkStyle}>Facebook</a>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{pretty(counts.facebook)} followers</div>
          </div>
          <div>
            <button onClick={() => amplify('facebook')} style={{ background: '#1877f2', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 8 }}>Amplify</button>
          </div>
        </div>

        <div style={{ marginTop: 6, fontSize: 12, color: '#9ca3af' }}>
          This is a simulated social showcase for in-app visibility. Values are game metrics, not verified social stats.
        </div>
      </div>
    </div>
  );
}
