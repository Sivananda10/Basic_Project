import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../api/predictionApi';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import './AdminDashboardPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getAdminDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="adm-loading"><div className="adm-spinner" /><p>Loading dashboard…</p></div>
  );
  if (error) return <div className="adm-error">{error}</div>;

  const {
    total_users, total_predictions, total_feedback, accurate, inaccurate,
    feedback_accuracy, hobby_stats = [], user_list = [],
    recent_predictions = [], recent_feedbacks = [], charts = {},
  } = data;

  const CHART_LABELS = {
    accuracy_comparison: 'Accuracy Comparison',
    feature_importance:  'Feature Importance',
    confusion_matrix:    'Confusion Matrix',
    hobby_distribution:  'Hobby Distribution',
    metrics_comparison:  'All Metrics Comparison',
    correlation_heatmap: 'Correlation Heatmap',
  };

  const catLabels = hobby_stats.map(h => h.name);
  const catData   = hobby_stats.map(h => h.count);
  const catColors = hobby_stats.map(h => h.color);

  const TABS = [
    { id: 'overview',    label: '📊 Overview' },
    { id: 'predictions', label: '🔮 Predictions' },
    { id: 'users',       label: '👥 Users' },
    { id: 'feedback',    label: '💬 Feedback' },
    { id: 'models',      label: '🤖 ML Models' },
  ];

  return (
    <div className="adm-root">
      {/* ── HERO ── */}
      <div className="adm-hero">
        <div className="adm-hero-content">
          <span className="adm-tag">⚡ Admin Panel</span>
          <h1 className="adm-title">Dashboard</h1>
          <p className="adm-subtitle">Platform overview, user management, and ML model insights.</p>
        </div>
      </div>

      {/* ── NAV TABS ── */}
      <div className="adm-tabs-wrap">
        <div className="adm-tabs">
          {TABS.map(t => (
            <button key={t.id}
              className={`adm-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-content">

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Stat cards */}
            <div className="adm-stats">
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>👥</div>
                <div className="adm-stat-value">{total_users}</div>
                <div className="adm-stat-label">Total Users</div>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(6,214,160,0.12)', color: '#06d6a0' }}>🔮</div>
                <div className="adm-stat-value">{total_predictions}</div>
                <div className="adm-stat-label">Predictions</div>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>💬</div>
                <div className="adm-stat-value">{total_feedback}</div>
                <div className="adm-stat-label">Feedbacks</div>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>🎯</div>
                <div className="adm-stat-value">{feedback_accuracy}%</div>
                <div className="adm-stat-label">Accuracy</div>
              </div>
            </div>

            {/* Charts row */}
            <div className="adm-charts-row">
              <div className="adm-card">
                <h3 className="adm-card-title">📊 Category Distribution</h3>
                <div className="adm-donut-wrap">
                  <Doughnut
                    data={{ labels: catLabels, datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 2, borderColor: '#12162a', hoverOffset: 8 }] }}
                    options={{ cutout: '65%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(18,22,42,0.95)', titleColor: '#e8ecff', bodyColor: '#e8ecff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 12 } } }}
                  />
                </div>
                <div className="adm-legend">
                  {hobby_stats.filter(h => h.count > 0).map(h => (
                    <div key={h.name} className="adm-legend-item">
                      <span className="adm-legend-dot" style={{ background: h.color }} />
                      <span>{h.icon} {h.name}</span>
                      <span className="adm-legend-count">{h.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-card">
                <h3 className="adm-card-title">📈 Feedback Split</h3>
                {total_feedback > 0 ? (
                  <div className="adm-bar-wrap">
                    <Bar
                      data={{ labels: ['Accurate', 'Inaccurate'], datasets: [{ data: [accurate, inaccurate], backgroundColor: ['rgba(34,197,94,0.7)', 'rgba(239,68,68,0.7)'], borderRadius: 12, borderSkipped: false }] }}
                      options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { stepSize: 1, color: 'rgba(255,255,255,0.4)', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } } }, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(18,22,42,0.95)', titleColor: '#e8ecff', bodyColor: '#e8ecff' } } }}
                    />
                  </div>
                ) : (
                  <div className="adm-empty-mini"><span>💬</span><p>No feedback yet</p></div>
                )}
              </div>
            </div>

            {/* Hobby category cards */}
            <div className="adm-card">
              <h3 className="adm-card-title">🏆 Hobby Categories</h3>
              <div className="adm-hobby-grid">
                {hobby_stats.map(h => (
                  <div key={h.name} className="adm-hobby-card" style={{ borderColor: `${h.color}30` }}>
                    <span className="adm-hobby-icon">{h.icon}</span>
                    <span className="adm-hobby-count" style={{ color: h.color }}>{h.count}</span>
                    <span className="adm-hobby-name">{h.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════════ PREDICTIONS TAB ═══════════ */}
        {activeTab === 'predictions' && (
          <div className="adm-card">
            <h3 className="adm-card-title">🔮 Recent Predictions ({recent_predictions.length})</h3>
            {recent_predictions.length > 0 ? (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Hobby</th>
                      <th>Role</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_predictions.map((p, i) => {
                      const catColor = hobby_stats.find(h => h.name === p.category)?.color || '#6366f1';
                      return (
                        <tr key={p.id}>
                          <td className="adm-td-num">{i + 1}</td>
                          <td>
                            <div className="adm-user-cell">
                              <div className="adm-avatar" style={{ background: `${catColor}25`, color: catColor }}>
                                {(p.full_name?.[0] || p.username?.[0] || 'U').toUpperCase()}
                              </div>
                              <div>
                                <div className="adm-user-name">{p.full_name}</div>
                                <div className="adm-user-handle">@{p.username}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="adm-hobby-badge" style={{ background: `${catColor}15`, color: catColor, borderColor: `${catColor}30` }}>
                              {p.predicted_hobby}
                            </span>
                          </td>
                          <td className="adm-td-role">{p.hobby_role}</td>
                          <td><span className="adm-cat-tag" style={{ color: catColor }}>{p.category}</span></td>
                          <td className="adm-td-date">
                            {new Date(p.predicted_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            {p.has_feedback
                              ? <span className="adm-fb-badge adm-fb-done">✓ Done</span>
                              : <span className="adm-fb-badge adm-fb-pending">Pending</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="adm-empty-mini"><span>🔮</span><p>No predictions yet</p></div>
            )}
          </div>
        )}

        {/* ═══════════ USERS TAB ═══════════ */}
        {activeTab === 'users' && (
          <div className="adm-card">
            <h3 className="adm-card-title">👥 Registered Users ({user_list.length})</h3>
            {user_list.length > 0 ? (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Predictions</th>
                      <th>Feedbacks</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user_list.map((u, i) => (
                      <tr key={u.id}>
                        <td className="adm-td-num">{i + 1}</td>
                        <td>
                          <div className="adm-user-cell">
                            <div className="adm-avatar" style={{ background: u.is_staff ? 'rgba(247,37,133,0.15)' : 'rgba(99,102,241,0.15)', color: u.is_staff ? '#f72585' : '#6366f1' }}>
                              {(u.full_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div className="adm-user-name">{u.full_name}</div>
                              <div className="adm-user-handle">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="adm-td-email">{u.email || '—'}</td>
                        <td>
                          {u.is_staff
                            ? <span className="adm-role-badge adm-role-admin">Admin</span>
                            : <span className="adm-role-badge adm-role-user">User</span>}
                        </td>
                        <td className="adm-td-count">{u.prediction_count}</td>
                        <td className="adm-td-count">{u.feedback_count}</td>
                        <td className="adm-td-date">
                          {new Date(u.date_joined).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="adm-empty-mini"><span>👥</span><p>No users yet</p></div>
            )}
          </div>
        )}

        {/* ═══════════ FEEDBACK TAB ═══════════ */}
        {activeTab === 'feedback' && (
          <div className="adm-card">
            <h3 className="adm-card-title">💬 Recent Feedback ({recent_feedbacks.length})</h3>
            {recent_feedbacks.length > 0 ? (
              <div className="adm-feedback-list">
                {recent_feedbacks.map(fb => (
                  <div key={fb.id} className={`adm-fb-card ${fb.is_accurate ? 'accurate' : 'inaccurate'}`}>
                    <div className="adm-fb-header">
                      <div className="adm-user-cell">
                        <div className="adm-avatar" style={{ background: fb.is_accurate ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: fb.is_accurate ? '#22c55e' : '#ef4444' }}>
                          {(fb.full_name?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div className="adm-user-name">{fb.full_name}</div>
                          <div className="adm-user-handle">@{fb.username}</div>
                        </div>
                      </div>
                      <div className="adm-fb-meta">
                        <span className={`adm-fb-status ${fb.is_accurate ? 'ok' : 'bad'}`}>
                          {fb.is_accurate ? '✓ Accurate' : '✗ Inaccurate'}
                        </span>
                        <span className="adm-fb-date">
                          {new Date(fb.submitted_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="adm-fb-body">
                      <span className="adm-fb-hobby">Hobby: <strong>{fb.hobby}</strong></span>
                      {fb.comments && <p className="adm-fb-comment">"{fb.comments}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="adm-empty-mini"><span>💬</span><p>No feedback submitted yet</p></div>
            )}
          </div>
        )}

        {/* ═══════════ ML MODELS TAB ═══════════ */}
        {activeTab === 'models' && (
          <div className="adm-card">
            <h3 className="adm-card-title">🤖 Model Visualizations</h3>
            {Object.values(charts).some(Boolean) ? (
              <div className="adm-ml-grid">
                {Object.entries(charts).map(([key, exists]) => exists && (
                  <div key={key} className="adm-ml-card">
                    <img
                      src={`http://localhost:8000/static/images/${key}.png`}
                      alt={CHART_LABELS[key] || key}
                      onError={e => { e.target.parentElement.style.display = 'none'; }}
                    />
                    <div className="adm-ml-label">{CHART_LABELS[key] || key.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="adm-empty-mini"><span>🤖</span><p>No model charts available. Train the model to generate visualizations.</p></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
