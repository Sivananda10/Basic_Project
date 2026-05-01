import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { getHistory } from '../api/predictionApi';
import './HistoryPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CAT_ICONS = {
  Sports:'🏅', Arts:'🎨', Academics:'📚', Analytical:'🧩',
  Health:'💪', Cooking:'🍳', Gardening:'🌱', Digital:'🎮',
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

  if (loading) return (
    <div className="hy-loading">
      <div className="hy-spinner" />
      <p>Loading history…</p>
    </div>
  );
  if (error) return <div className="hy-error-box">{error}</div>;

  const {
    predictions = [], total = 0, top_hobby, accuracy_pct,
    feedback_count = 0, accurate = 0, inaccurate = 0, charts = {},
  } = data || {};

  const catLabels = charts.categories?.labels || [];
  const catData   = charts.categories?.data   || [];
  const catColors = charts.categories?.colors || [];

  const fmt = s => (s || '').replace(/_/g, ' ');

  return (
    <div className="hy-root">
      {/* ── HERO ── */}
      <div className="hy-hero">
        <span className="hy-tag">Analytics</span>
        <h1 className="hy-title">Prediction History</h1>
        <p className="hy-subtitle">Track every prediction, hobby distribution, and feedback at a glance.</p>
      </div>

      <div className="hy-content">
        {predictions.length > 0 ? (
          <>
            {/* ── STAT CARDS ── */}
            <div className="hy-stats">
              <div className="hy-stat-card">
                <div className="hy-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>✨</div>
                <div className="hy-stat-value">{total}</div>
                <div className="hy-stat-label">Total Predictions</div>
              </div>
              <div className="hy-stat-card">
                <div className="hy-stat-icon" style={{ background: 'rgba(6,214,160,0.12)', color: '#06d6a0' }}>🏆</div>
                <div className="hy-stat-value hy-stat-sm">{top_hobby || '—'}</div>
                <div className="hy-stat-label">Top Hobby</div>
              </div>
              <div className="hy-stat-card">
                <div className="hy-stat-icon" style={{ background: 'rgba(247,37,133,0.12)', color: '#f72585' }}>🎯</div>
                <div className="hy-stat-value">{accuracy_pct != null ? `${accuracy_pct}%` : '—'}</div>
                <div className="hy-stat-label">Feedback Accuracy</div>
              </div>
              <div className="hy-stat-card">
                <div className="hy-stat-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>💬</div>
                <div className="hy-stat-value">{feedback_count}</div>
                <div className="hy-stat-label">Feedbacks Given</div>
              </div>
            </div>

            {/* ── CHARTS ROW ── */}
            <div className="hy-charts">
              {/* Category Distribution */}
              <div className="hy-card">
                <h3 className="hy-card-title">📊 Category Distribution</h3>
                <div className="hy-donut-wrap">
                  <Doughnut
                    data={{ labels: catLabels, datasets: [{
                      data: catData,
                      backgroundColor: catColors,
                      borderWidth: 2,
                      borderColor: '#12162a',
                      hoverOffset: 8,
                    }] }}
                    options={{
                      cutout: '65%',
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(18,22,42,0.95)',
                          titleColor: '#e8ecff',
                          bodyColor: '#e8ecff',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderWidth: 1,
                          cornerRadius: 12,
                          padding: 12,
                          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` },
                        },
                      },
                    }}
                  />
                </div>
                <div className="hy-legend">
                  {catLabels.map((l, i) => catData[i] > 0 && (
                    <div key={l} className="hy-legend-item">
                      <span className="hy-legend-dot" style={{ background: catColors[i] }} />
                      <span>{l}</span>
                      <span className="hy-legend-count">{catData[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Split */}
              <div className="hy-card">
                <h3 className="hy-card-title">📈 Feedback Split</h3>
                {feedback_count > 0 ? (
                  <div className="hy-bar-wrap">
                    <Bar
                      data={{
                        labels: ['Accurate', 'Inaccurate'],
                        datasets: [{
                          data: [accurate, inaccurate],
                          backgroundColor: ['rgba(6,214,160,0.7)', 'rgba(247,37,133,0.7)'],
                          borderRadius: 12,
                          borderSkipped: false,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { stepSize: 1, color: 'rgba(255,255,255,0.4)', font: { size: 11 } } },
                          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: 'rgba(18,22,42,0.95)',
                            titleColor: '#e8ecff',
                            bodyColor: '#e8ecff',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            cornerRadius: 12,
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="hy-empty-mini">
                    <span>💬</span>
                    <p>No feedback submitted yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── PREDICTION TABLE ── */}
            <div className="hy-card">
              <h3 className="hy-card-title">📋 All Predictions</h3>
              <div className="hy-table-wrap">
                <table className="hy-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Predicted Hobby</th>
                      <th>Role</th>
                      <th>Category</th>
                      <th>Feedback</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((pred, i) => {
                      const category = pred.category || pred.predicted_hobby || '';
                      const catIcon = CAT_ICONS[category] || '⭐';
                      const catColor = catColors[catLabels.indexOf(category)] || '#6366f1';
                      return (
                        <tr key={pred.id}>
                          <td className="hy-td-num">{i + 1}</td>
                          <td className="hy-td-date">
                            {new Date(pred.predicted_at).toLocaleString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                          <td>
                            <span className="hy-hobby-badge" style={{ background: `${catColor}15`, color: catColor, borderColor: `${catColor}30` }}>
                              {catIcon} {fmt(pred.predicted_hobby)}
                            </span>
                          </td>
                          <td className="hy-td-role">{pred.hobby_role || '—'}</td>
                          <td>
                            <span className="hy-cat-tag" style={{ color: catColor }}>{category}</span>
                          </td>
                          <td>
                            {pred.has_feedback != null ? (
                              pred.has_feedback
                                ? (pred.feedback?.is_accurate
                                  ? <span className="hy-fb hy-fb-ok">✓ Accurate</span>
                                  : <span className="hy-fb hy-fb-bad">✗ Inaccurate</span>)
                                : <span className="hy-fb hy-fb-pending">Pending</span>
                            ) : <span className="hy-fb hy-fb-pending">Pending</span>}
                          </td>
                          <td>
                            {!pred.has_feedback ? (
                              <Link to={`/feedback/${pred.id}`} className="hy-btn-action">
                                💬 Feedback
                              </Link>
                            ) : (
                              <span className="hy-done-tag">Done</span>
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
          <div className="hy-card hy-empty-state">
            <div className="hy-empty-icon">🔮</div>
            <h3>No predictions yet</h3>
            <p>Make your first prediction to see your history and analytics here.</p>
            <Link to="/predict" className="hy-btn-primary">✨ Predict Now</Link>
          </div>
        )}
      </div>
    </div>
  );
}
