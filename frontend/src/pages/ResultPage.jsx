import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';

const CATEGORY_COLORS = {
  Sports:     { from: '#06d6a0', to: '#0097a7' },
  Arts:       { from: '#f72585', to: '#b5179e' },
  Academics:  { from: '#4361ee', to: '#3a0ca3' },
  Analytical: { from: '#7209b7', to: '#560bad' },
  Health:     { from: '#f97316', to: '#ea580c' },
};

export default function ResultPage() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const prediction = location.state?.prediction;
  const canvasRef  = useRef(null);

  useEffect(() => {
    if (!prediction) navigate('/predict');
    createConfetti();
  }, []);

  function createConfetti() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#6366f1','#f72585','#06d6a0','#ffd166','#4cc9f0','#f97316'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: -20,
      r: Math.random() * 6 + 2, d: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5, tiltAngle: 0,
      tiltAngleInc: Math.random() * 0.07 + 0.05,
    }));
    let running = true, frame = 0;
    const animate = () => {
      if (!running || frame > 200) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height); frame++;
      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(frame / 10) + p.d + p.r / 2) * 0.6;
        p.x += Math.sin(frame / 15);
        p.tilt = Math.sin(p.tiltAngle) * 15;
        ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => { running = false; };
  }

  if (!prediction) return null;

  const hobby         = prediction.predicted_hobby  || 'Unknown';
  const originalHobby = prediction.original_hobby;
  const category      = prediction.category         || '';
  const desc          = prediction.description      || '';
  const healthWarning = prediction.health_warning;
  const alts          = prediction.alternatives     || [];
  const colors        = CATEGORY_COLORS[category]   || { from: '#6366f1', to: '#3a0ca3' };
  const fmt           = (s) => (s || '').replace(/_/g, ' ');

  return (
    <div className="rp-root">
      <canvas ref={canvasRef} className="rp-confetti" />

      <div className="rp-container">

        {/* ── Health warning banner ─────────────────────────────────────── */}
        {healthWarning && (
          <div className="rp-health-warning">
            <div className="rp-hw-icon">⚠️</div>
            <div className="rp-hw-content">
              <h4>Health Advisory</h4>
              {originalHobby && (
                <p className="rp-hw-override">
                  <strong>{fmt(originalHobby)}</strong> was replaced by{' '}
                  <strong>{fmt(hobby)}</strong> as the primary recommendation
                  based on your child's health condition.
                </p>
              )}
              <p>{healthWarning}</p>
              <p className="rp-hw-note">
                Always consult a doctor before starting a new physical activity.
                {originalHobby && ` ${fmt(originalHobby)} is listed as a secondary option below — play with care and medical guidance.`}
              </p>
            </div>
          </div>
        )}

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <div className="rp-hero" style={{
          borderColor: `${colors.from}44`,
        }}>
          <p className="rp-main-label">Your Main Hobby</p>
          <div className="rp-category-badge" style={{ background: `${colors.from}33`, color: colors.from }}>
            {category}
          </div>

          <h1 className="rp-hobby-name">{fmt(hobby)}</h1>
          <p className="rp-desc">{desc}</p>
        </div>

        {/* ── Secondary hobbies ─────────────────────────────────────────── */}
        {alts.length > 0 && (
          <div className="rp-secondary">
            <h3 className="rp-secondary-title">Other hobbies your child may enjoy</h3>
            <p className="rp-secondary-subtitle">Based on their answers across all categories</p>
            <div className="rp-secondary-grid">
              {alts.slice(0, 3).map((alt, i) => {
                const ac = CATEGORY_COLORS[alt.category] || { from: '#6366f1', to: '#3a0ca3' };
                return (
                  <div key={i} className="rp-sec-card" style={{
                    borderColor: `${ac.from}33`,
                  }}>
                    <div className="rp-sec-info">
                      <span className="rp-sec-hobby">{fmt(alt.hobby)}</span>
                      <span className="rp-sec-cat" style={{ color: ac.from }}>{alt.category}</span>
                      {alt.health_warning && (
                        <span className="rp-sec-health-flag">Play with care</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="rp-actions">
          <button className="rp-btn rp-btn-primary" onClick={() => navigate('/predict')}>
            Try Again
          </button>
          <button className="rp-btn rp-btn-secondary" onClick={() => navigate('/history')}>
            View History
          </button>
          <button className="rp-btn rp-btn-secondary" onClick={() => navigate('/feedback', { state: { predictionId: prediction.id } })}>
            Give Feedback
          </button>
        </div>

        {/* ── Tips ──────────────────────────────────────────────────────── */}
        <div className="rp-tips">
          <h3>Getting Started with {fmt(hobby)}</h3>
          <ul>
            <li>Start with 15–20 minutes per day and gradually increase</li>
            <li>Look for local clubs, classes, or online tutorials</li>
            <li>Let your child explore without pressure — enjoyment comes first!</li>
            <li>Track their progress and celebrate small wins 🎉</li>
            {healthWarning && (
              <li style={{ color: '#fbbf24' }}>
                ⚠️ Given the health condition, always check with a doctor before intense activity
              </li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}
