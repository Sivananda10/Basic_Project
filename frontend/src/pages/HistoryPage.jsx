import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { getHistory } from '../api/predictionApi';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler);

/* Per-hobby badge styling */
const HOBBY_BADGE = {
  'Sports':             { bg: 'rgba(67,97,238,.1)',   color: '#4361ee', border: 'rgba(67,97,238,.15)',   icon: 'bi-trophy' },
  'Arts':               { bg: 'rgba(247,37,133,.1)',  color: '#f72585', border: 'rgba(247,37,133,.15)',  icon: 'bi-palette' },
  'Academics':          { bg: 'rgba(6,214,160,.1)',   color: '#06d6a0', border: 'rgba(6,214,160,.15)',   icon: 'bi-book' },
  'Analytical Thinking':{ bg: 'rgba(255,209,102,.12)',color: '#c78a00', border: 'rgba(255,209,102,.2)',  icon: 'bi-cpu' },
  'Health & Fitness':   { bg: 'rgba(76,201,240,.1)',  color: '#0096c7', border: 'rgba(76,201,240,.15)',  icon: 'bi-heart-pulse' },
};

export default function HistoryPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getHistory()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error)   return <div style={{padding:'40px'}}><div className="alert alert-error">{error}</div></div>;

  const { predictions = [], total = 0, top_hobby, accuracy_pct, feedback_count = 0, accurate = 0, inaccurate = 0, charts = {} } = data || {};
  const catLabels  = charts.categories?.labels  || [];
  const catData    = charts.categories?.data    || [];
  const catColors  = charts.categories?.colors  || [];
  const confLabels = charts.confidence?.labels  || [];
  const confData   = charts.confidence?.data    || [];

  const STAT_CARDS = [
    { ico: 'bi-magic', bg: 'rgba(67,97,238,.09)', color: '#4361ee', border: 'rgba(67,97,238,.12)', valStyle: 'linear-gradient(135deg,#4361ee,#7c3aed)', val: total, lbl: 'Total Predictions' },
    { ico: 'bi-trophy', bg: 'rgba(6,214,160,.09)', color: '#06d6a0', border: 'rgba(6,214,160,.12)', valStyle: 'linear-gradient(135deg,#06d6a0,#4cc9f0)', val: top_hobby || '—', lbl: 'Top Category', sm: true },
    { ico: 'bi-shield-check', bg: 'rgba(247,37,133,.09)', color: '#f72585', border: 'rgba(247,37,133,.12)', valStyle: 'linear-gradient(135deg,#f72585,#ff6b9d)', val: accuracy_pct != null ? `${accuracy_pct}%` : '—', lbl: 'Feedback Accuracy' },
    { ico: 'bi-chat-dots', bg: 'rgba(255,209,102,.1)', color: '#f4a300', border: 'rgba(255,209,102,.18)', valStyle: 'linear-gradient(135deg,#ffd166,#f4a300)', val: feedback_count, lbl: 'Feedbacks Given' },
  ];

  return (
    <>
      <style>{`
        .hy-hero { background:linear-gradient(135deg,#06061a 0%,#0d0d22 60%,#050510 100%); padding:60px 0 50px; position:relative; overflow:hidden; }
        .hy-hero::before { content:''; position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(67,97,238,.2),transparent 65%); top:-20%; right:-5%; filter:blur(60px); pointer-events:none; }
        .hy-page { background:#f4f6fb; padding:40px 0 80px; }
        .hy-page-tag { display:inline-block; padding:5px 16px; border-radius:99px; font-size:.72rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; border:1px solid rgba(67,97,238,.3); background:rgba(67,97,238,.1); color:#7da3ff; margin-bottom:14px; }
        .hy-hero-title { font-size:clamp(1.8rem,4vw,2.6rem); font-weight:800; color:#fff; letter-spacing:-.6px; margin-bottom:8px; }
        .hy-hero-sub   { font-size:.95rem; color:#8888a8; }
        .hy-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
        @media(max-width:700px){ .hy-stats-grid { grid-template-columns:1fr 1fr; } }
        .hy-stat { background:#fff; border-radius:20px; padding:26px 22px; border:1px solid rgba(0,0,0,.06); box-shadow:0 4px 20px rgba(0,0,0,.04); text-align:center; transition:all .4s cubic-bezier(.16,1,.3,1); }
        .hy-stat:hover { transform:translateY(-5px); box-shadow:0 14px 36px rgba(67,97,238,.09); border-color:rgba(67,97,238,.14); }
        .hy-stat-ico { width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; margin:0 auto 14px; }
        .hy-stat-val { font-size:2rem; font-weight:800; letter-spacing:-1px; line-height:1; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hy-stat-val.sm { font-size:1.3rem; }
        .hy-stat-lbl { font-size:.72rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.9px; margin-top:6px; }
        .hy-charts-row { display:grid; grid-template-columns:4fr 5fr 3fr; gap:20px; margin-bottom:24px; }
        @media(max-width:900px){ .hy-charts-row { grid-template-columns:1fr; } }
        .hy-card { background:#fff; border-radius:20px; padding:28px 24px; border:1px solid rgba(0,0,0,.06); box-shadow:0 4px 20px rgba(0,0,0,.04); margin-bottom:24px; }
        .hy-card-title { font-size:.93rem; font-weight:800; color:#1a1a2e; letter-spacing:-.2px; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .hy-card-title i { color:#4361ee; }
        .hy-table { width:100%; border-collapse:separate; border-spacing:0; }
        .hy-table thead th { font-size:.68rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.9px; padding:10px 14px; border-bottom:2px solid #f0f2f8; white-space:nowrap; }
        .hy-table tbody tr { transition:background .2s; }
        .hy-table tbody tr:hover { background:#fafbff; }
        .hy-table tbody td { padding:13px 14px; border-bottom:1px solid #f0f2f8; font-size:.84rem; color:#374151; vertical-align:middle; }
        .hy-table tbody tr:last-child td { border-bottom:none; }
        .hy-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:99px; font-size:.72rem; font-weight:700; border:1px solid; }
        .hy-conf-wrap { width:80px; height:6px; background:#f0f2f8; border-radius:3px; display:inline-block; vertical-align:middle; margin-right:6px; }
        .hy-conf-bar  { height:100%; border-radius:3px; background:linear-gradient(90deg,#4361ee,#7c3aed); }
        .hy-fb-ok  { color:#065f46; background:#d1fae5; padding:3px 10px; border-radius:99px; font-size:.7rem; font-weight:700; }
        .hy-fb-bad { color:#7f1d1d; background:#fee2e2; padding:3px 10px; border-radius:99px; font-size:.7rem; font-weight:700; }
        .hy-fb-pend{ color:#6b7280; background:#f3f4f6; padding:3px 10px; border-radius:99px; font-size:.7rem; font-weight:700; }
        .hy-btn-fb { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:10px; font-size:.75rem; font-weight:700; background:linear-gradient(135deg,#4361ee,#7c3aed); color:#fff; text-decoration:none; border:none; cursor:pointer; transition:all .25s; box-shadow:0 2px 10px rgba(67,97,238,.25); }
        .hy-btn-fb:hover { transform:translateY(-1px); color:#fff; box-shadow:0 6px 18px rgba(67,97,238,.32); }
        .hy-empty { text-align:center; padding:60px 20px; }
        .hy-empty-icon { font-size:3.5rem; opacity:.2; display:block; margin-bottom:16px; }
      `}</style>

      {/* Hero */}
      <div className="hy-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="hy-page-tag">Analytics</span>
          <h1 className="hy-hero-title">My Prediction History</h1>
          <p className="hy-hero-sub">Track every prediction, confidence trend, and hobby distribution at a glance.</p>
        </div>
      </div>

      <div className="hy-page">
        <div className="container">

          {predictions.length > 0 ? (
            <>
              {/* ── STAT ROW ── */}
              <div className="hy-stats-grid">
                {STAT_CARDS.map((s, i) => (
                  <div key={i} className="hy-stat">
                    <div className="hy-stat-ico" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      <i className={`bi ${s.ico}`} />
                    </div>
                    <div className={`hy-stat-val${s.sm ? ' sm' : ''}`} style={{ backgroundImage: s.valStyle }}>{s.val}</div>
                    <div className="hy-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* ── CHARTS ROW ── */}
              <div className="hy-charts-row">
                {/* Donut: Category Distribution */}
                <div className="hy-card">
                  <div className="hy-card-title"><i className="bi bi-pie-chart-fill" /> Category Distribution</div>
                  <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut
                      data={{ labels: catLabels, datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }] }}
                      options={{ cutout: '68%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } } } }}
                    />
                  </div>
                  {/* Legend */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {catLabels.map((l, i) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '.7rem', fontWeight: 600, color: '#374151' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: catColors[i], flexShrink: 0 }} />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line: Confidence over time */}
                <div className="hy-card">
                  <div className="hy-card-title"><i className="bi bi-graph-up-arrow" /> Confidence Score Trend</div>
                  <div style={{ position: 'relative', height: '220px' }}>
                    {confLabels.length > 0 ? (
                      <Line
                        data={{ labels: confLabels, datasets: [{ label: 'Confidence %', data: confData, fill: true, tension: 0.45, borderColor: '#4361ee', borderWidth: 2.5, pointBackgroundColor: '#4361ee', pointRadius: 5, pointHoverRadius: 7, backgroundColor: (ctx) => { const g = ctx.chart.ctx.createLinearGradient(0,0,0,200); g.addColorStop(0,'rgba(67,97,238,.25)'); g.addColorStop(1,'rgba(67,97,238,0)'); return g; } }] }}
                        options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min:0, max:100, grid:{color:'rgba(0,0,0,.04)'}, ticks:{font:{size:11},callback:v=>v+'%'} }, x: { grid:{display:false}, ticks:{font:{size:11}} } }, plugins: { legend:{display:false}, tooltip:{callbacks:{label:ctx=>` ${ctx.parsed.y}% confidence`}} } }}
                      />
                    ) : (
                      <div className="hy-empty" style={{padding:'20px 0'}}><i className="bi bi-graph-up hy-empty-icon" style={{fontSize:'1.8rem'}} /><p style={{fontSize:'.82rem',color:'#9ca3af',margin:0}}>Not enough data yet</p></div>
                    )}
                  </div>
                </div>

                {/* Bar: Feedback split */}
                <div className="hy-card">
                  <div className="hy-card-title"><i className="bi bi-bar-chart-fill" /> Feedback Split</div>
                  {feedback_count > 0 ? (
                    <div style={{ position: 'relative', height: '220px' }}>
                      <Bar
                        data={{ labels: ['Accurate', 'Inaccurate'], datasets: [{ data: [accurate, inaccurate], backgroundColor: ['rgba(6,214,160,.8)', 'rgba(247,37,133,.8)'], borderRadius: 10, borderSkipped: false }] }}
                        options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero:true, grid:{color:'rgba(0,0,0,.04)'}, ticks:{stepSize:1,font:{size:11}} }, x: { grid:{display:false}, ticks:{font:{size:11}} } }, plugins: { legend: { display: false } } }}
                      />
                    </div>
                  ) : (
                    <div className="hy-empty" style={{padding:'40px 10px'}}><i className="bi bi-chat-square-dots hy-empty-icon" style={{fontSize:'2rem'}} /><p style={{fontSize:'.82rem',color:'#9ca3af',margin:0}}>No feedback submitted yet</p></div>
                  )}
                </div>
              </div>

              {/* ── PREDICTION TABLE ── */}
              <div className="hy-card">
                <div className="hy-card-title"><i className="bi bi-table" /> All Predictions</div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="hy-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Date</th><th>Fav. Subject</th><th>Predicted Hobby</th><th>Confidence</th><th>Feedback</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred, i) => {
                        const badge = HOBBY_BADGE[pred.predicted_hobby] || HOBBY_BADGE['Academics'];
                        return (
                          <tr key={pred.id}>
                            <td style={{ color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ color: '#6b7280' }}>{new Date(pred.predicted_at).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                            <td style={{ fontWeight: 600 }}>{pred.input_data?.fav_sub || '—'}</td>
                            <td>
                              <span className="hy-badge" style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
                                <i className={`bi ${badge.icon}`} />
                                {pred.predicted_hobby}
                              </span>
                            </td>
                            <td>
                              {pred.confidence_score != null ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div className="hy-conf-wrap"><div className="hy-conf-bar" style={{ width: `${pred.confidence_score}%` }} /></div>
                                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#4361ee' }}>{pred.confidence_score}%</span>
                                </div>
                              ) : <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                            <td>
                              {pred.has_feedback != null ? (
                                pred.has_feedback
                                  ? (pred.feedback?.is_accurate
                                    ? <span className="hy-fb-ok"><i className="bi bi-check-circle" /> Accurate</span>
                                    : <span className="hy-fb-bad"><i className="bi bi-x-circle" /> Inaccurate</span>)
                                  : <span className="hy-fb-pend">Pending</span>
                              ) : <span className="hy-fb-pend">Pending</span>}
                            </td>
                            <td>
                              {!pred.has_feedback ? (
                                <Link to={`/feedback/${pred.id}`} className="hy-btn-fb">
                                  <i className="bi bi-chat-dots" /> Feedback
                                </Link>
                              ) : (
                                <span style={{ fontSize: '.75rem', color: '#d1d5db' }}>Done</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="hy-card">
              <div className="hy-empty">
                <i className="bi bi-clock-history hy-empty-icon" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '8px' }}>No predictions yet</h4>
                <p style={{ color: '#9ca3af', fontSize: '.88rem', marginBottom: '24px' }}>Make your first prediction to see your history and analytics here.</p>
                <Link to="/predict" className="hy-btn-fb" style={{ padding: '12px 28px', fontSize: '.9rem' }}>
                  <i className="bi bi-magic" /> Predict Now
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
