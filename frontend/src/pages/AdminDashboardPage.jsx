import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../api/predictionApi';

const HOBBY_META = {
  'Academics':          { icon: 'bi-book-fill',     color: '#06d6a0', bg: 'rgba(6,214,160,.1)'   },
  'Sports':             { icon: 'bi-trophy-fill',   color: '#4361ee', bg: 'rgba(67,97,238,.1)'   },
  'Arts':               { icon: 'bi-palette-fill',  color: '#f72585', bg: 'rgba(247,37,133,.1)'  },
  'Analytical Thinking':{ icon: 'bi-cpu-fill',      color: '#ffd166', bg: 'rgba(255,209,102,.15)'},
  'Health & Fitness':   { icon: 'bi-heart-pulse-fill', color: '#4cc9f0', bg: 'rgba(76,201,240,.1)' },
};

const HOBBY_BADGE = {
  'Sports':             { bg: 'rgba(67,97,238,.1)', color: '#4361ee', border: 'rgba(67,97,238,.2)' },
  'Arts':               { bg: 'rgba(247,37,133,.1)', color: '#f72585', border: 'rgba(247,37,133,.2)' },
  'Academics':          { bg: 'rgba(6,214,160,.1)', color: '#06d6a0', border: 'rgba(6,214,160,.2)' },
  'Analytical Thinking':{ bg: 'rgba(255,209,102,.12)', color: '#c78a00', border: 'rgba(255,209,102,.25)' },
  'Health & Fitness':   { bg: 'rgba(76,201,240,.1)', color: '#0096c7', border: 'rgba(76,201,240,.2)' },
};

export default function AdminDashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error)   return <div style={{ padding: '40px' }}><div className="alert alert-error">{error}</div></div>;

  const { total_users, total_predictions, total_feedback, feedback_accuracy, hobby_stats, charts, recent_predictions } = data;

  const TOP_STATS = [
    { label: 'Total Users',       val: total_users,       ico: 'bi-people-fill',     c: '#4361ee', bg: 'rgba(67,97,238,.12)',   grad: 'linear-gradient(135deg,#4361ee,#7c3aed)' },
    { label: 'Total Predictions', val: total_predictions, ico: 'bi-magic',           c: '#06d6a0', bg: 'rgba(6,214,160,.12)',   grad: 'linear-gradient(135deg,#06d6a0,#4cc9f0)' },
    { label: 'Feedback Received', val: total_feedback,    ico: 'bi-chat-dots-fill',  c: '#f4a300', bg: 'rgba(255,209,102,.15)', grad: 'linear-gradient(135deg,#ffd166,#f4a300)' },
    { label: 'Feedback Accuracy', val: `${feedback_accuracy}%`, ico: 'bi-graph-up', c: '#4cc9f0', bg: 'rgba(76,201,240,.12)',  grad: 'linear-gradient(135deg,#4cc9f0,#0096c7)' },
  ];

  const CHART_LABELS = {
    accuracy_comparison: 'Accuracy Comparison',
    feature_importance:  'Feature Importance',
    confusion_matrix:    'Confusion Matrix',
    hobby_distribution:  'Hobby Distribution',
    metrics_comparison:  'All Metrics Comparison',
    correlation_heatmap: 'Correlation Heatmap',
  };

  return (
    <>
      <style>{`
        .ad-hero { background:linear-gradient(135deg,#06061a 0%,#0d0d22 60%,#050510 100%); padding:60px 0 50px; position:relative; overflow:hidden; }
        .ad-hero::before { content:''; position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(67,97,238,.2),transparent 65%); top:-20%; right:-5%; filter:blur(60px); pointer-events:none; }
        .ad-page-tag { display:inline-block; padding:5px 16px; border-radius:99px; font-size:.72rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; border:1px solid rgba(67,97,238,.3); background:rgba(67,97,238,.1); color:#7da3ff; margin-bottom:14px; }
        .ad-hero-title { font-size:clamp(1.8rem,4vw,2.6rem); font-weight:800; color:#fff; letter-spacing:-.6px; margin-bottom:8px; }
        .ad-hero-sub   { font-size:.95rem; color:#8888a8; }
        .ad-page  { background:#f4f6fb; padding:40px 0 80px; }
        .ad-top-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:28px; }
        @media(max-width:800px){ .ad-top-grid { grid-template-columns:repeat(2,1fr); } }
        .ad-top-card { background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:20px; padding:28px 22px; box-shadow:0 4px 20px rgba(0,0,0,.04); display:flex; align-items:center; gap:18px; transition:all .4s cubic-bezier(.16,1,.3,1); }
        .ad-top-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(67,97,238,.08); border-color:rgba(67,97,238,.14); }
        .ad-top-ico { width:54px; height:54px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; }
        .ad-top-val { font-size:1.9rem; font-weight:800; letter-spacing:-1px; line-height:1.1; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .ad-top-lbl { font-size:.72rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.9px; margin-top:3px; }
        .ad-card { background:#fff; border-radius:20px; padding:28px 24px; border:1px solid rgba(0,0,0,.06); box-shadow:0 4px 20px rgba(0,0,0,.04); margin-bottom:24px; }
        .ad-card-title { font-size:.93rem; font-weight:800; color:#1a1a2e; letter-spacing:-.2px; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .ad-card-title i { color:#4361ee; }
        .ad-hobby-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; }
        .ad-hobby-card { border-radius:16px; padding:28px 20px; text-align:center; border:1px solid transparent; transition:all .35s; }
        .ad-hobby-card:hover { transform:translateY(-4px); }
        .ad-hobby-ico  { font-size:1.5rem; margin-bottom:10px; }
        .ad-hobby-val  { font-size:2rem; font-weight:800; letter-spacing:-1px; line-height:1; margin-bottom:4px; }
        .ad-hobby-lbl  { font-size:.72rem; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.8px; }
        .ad-charts-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:18px; }
        .ad-chart-card  { border:1px solid rgba(0,0,0,.07); border-radius:16px; overflow:hidden; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.04); transition:all .3s; }
        .ad-chart-card:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(0,0,0,.08); }
        .ad-chart-card img { width:100%; height:auto; display:block; }
        .ad-chart-label { text-align:center; padding:10px 12px; font-size:.78rem; font-weight:700; color:#6b7280; background:#fafbff; border-top:1px solid rgba(0,0,0,.05); }
        .ad-table { width:100%; border-collapse:separate; border-spacing:0; }
        .ad-table thead th { font-size:.68rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.9px; padding:10px 14px; border-bottom:2px solid #f0f2f8; }
        .ad-table tbody tr { transition:background .2s; }
        .ad-table tbody tr:hover { background:#fafbff; }
        .ad-table tbody td { padding:12px 14px; border-bottom:1px solid #f0f2f8; font-size:.84rem; color:#374151; vertical-align:middle; }
        .ad-table tbody tr:last-child td { border-bottom:none; }
        .ad-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:99px; font-size:.72rem; font-weight:700; border:1px solid; }
      `}</style>

      {/* Hero */}
      <div className="ad-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="ad-page-tag">Admin</span>
          <h1 className="ad-hero-title"><i className="bi bi-speedometer2" style={{ marginRight: '10px' }} />Admin Dashboard</h1>
          <p className="ad-hero-sub">Platform overview, ML model stats, and recent activity.</p>
        </div>
      </div>

      <div className="ad-page">
        <div className="container">

          {/* ── TOP STATS ── */}
          <div className="ad-top-grid">
            {TOP_STATS.map(s => (
              <div key={s.label} className="ad-top-card">
                <div className="ad-top-ico" style={{ background: s.bg, color: s.c }}>
                  <i className={`bi ${s.ico}`} />
                </div>
                <div>
                  <div className="ad-top-val" style={{ backgroundImage: s.grad }}>{s.val}</div>
                  <div className="ad-top-lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── HOBBY DISTRIBUTION ── */}
          <div className="ad-card">
            <div className="ad-card-title"><i className="bi bi-bar-chart-line" /> Hobby Category Distribution</div>
            <div className="ad-hobby-grid">
              {Object.entries(hobby_stats || {}).map(([hobby, count]) => {
                const m = HOBBY_META[hobby] || { icon: 'bi-stars', color: '#7c3aed', bg: 'rgba(124,58,237,.1)' };
                return (
                  <div key={hobby} className="ad-hobby-card" style={{ background: m.bg, borderColor: m.color + '33' }}>
                    <div className="ad-hobby-ico"><i className={`bi ${m.icon}`} style={{ color: m.color, fontSize: '1.6rem' }} /></div>
                    <div className="ad-hobby-val" style={{ color: m.color }}>{count}</div>
                    <div className="ad-hobby-lbl">{hobby}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── ML CHARTS ── */}
          {Object.values(charts || {}).some(Boolean) && (
            <div className="ad-card">
              <div className="ad-card-title"><i className="bi bi-bar-chart" /> Model Visualizations</div>
              <div className="ad-charts-grid">
                {Object.entries(charts || {}).map(([key, exists]) => exists && (
                  <div key={key} className="ad-chart-card">
                    <img
                      src={`http://localhost:8000/static/images/${key}.png`}
                      alt={CHART_LABELS[key] || key}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div className="ad-chart-label">{CHART_LABELS[key] || key.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RECENT PREDICTIONS ── */}
          <div className="ad-card">
            <div className="ad-card-title"><i className="bi bi-clock-history" /> Recent Predictions</div>
            {recent_predictions && recent_predictions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="ad-table">
                  <thead>
                    <tr><th>#</th><th>User</th><th>Date</th><th>Predicted Hobby</th><th>Confidence</th></tr>
                  </thead>
                  <tbody>
                    {recent_predictions.map((pred, i) => {
                      const badge = HOBBY_BADGE[pred.predicted_hobby] || {};
                      return (
                        <tr key={pred.id}>
                          <td style={{ color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{pred.user?.username || '—'}</td>
                          <td style={{ color: '#6b7280' }}>
                            {new Date(pred.predicted_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <span className="ad-badge" style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
                              {pred.predicted_hobby}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#4361ee' }}>
                            {pred.confidence_score != null ? `${pred.confidence_score}%` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '.88rem' }}>
                <i className="bi bi-clock-history" style={{ fontSize: '2.5rem', opacity: .25, display: 'block', marginBottom: '12px' }} />
                No predictions yet.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
