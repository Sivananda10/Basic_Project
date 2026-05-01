import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';

const CAT_COLORS = {
  Sports:    { from:'#06d6a0', to:'#0097a7' },
  Arts:      { from:'#f72585', to:'#b5179e' },
  Academics: { from:'#4361ee', to:'#3a0ca3' },
  Analytical:{ from:'#7209b7', to:'#560bad' },
  Health:    { from:'#f97316', to:'#ea580c' },
  Cooking:   { from:'#22c55e', to:'#16a34a' },
  Gardening: { from:'#14b8a6', to:'#0d9488' },
  Digital:   { from:'#8b5cf6', to:'#7c3aed' },
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!prediction) navigate('/predict');
    createConfetti();
  }, [navigate, prediction]);

  function createConfetti() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#6366f1','#f72585','#06d6a0','#ffd166','#4cc9f0','#f97316'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random()*canvas.width, y: -20,
      r: Math.random()*6+2, d: Math.random()*4+1,
      color: colors[Math.floor(Math.random()*colors.length)],
      tilt: Math.random()*10-5, tiltAngle: 0, tiltAngleInc: Math.random()*0.07+0.05,
    }));
    let running = true, frame = 0;
    const animate = () => {
      if (!running || frame > 200) { ctx.clearRect(0,0,canvas.width,canvas.height); return; }
      ctx.clearRect(0,0,canvas.width,canvas.height); frame++;
      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(frame/10)+p.d+p.r/2)*0.6;
        p.x += Math.sin(frame/15);
        p.tilt = Math.sin(p.tiltAngle)*15;
        ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color;
        ctx.moveTo(p.x+p.tilt+p.r/4, p.y);
        ctx.lineTo(p.x+p.tilt, p.y+p.tilt+p.r/4);
        ctx.stroke();
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => { running = false; };
  }

  if (!prediction) return null;

  const hobby = prediction.predicted_hobby || 'Unknown';
  const role = prediction.hobby_role || '';
  const category = prediction.category || '';
  const desc = prediction.description || '';
  const icon = prediction.icon || '⭐';
  const reason = prediction.recommendation_reason || '';
  const improvements = prediction.improvement_suggestions || [];
  const careers = prediction.career_paths || [];
  const healthWarning = prediction.health_warning;
  const alts = prediction.alternatives || [];
  const colors = CAT_COLORS[category] || { from:'#6366f1', to:'#3a0ca3' };
  const fmt = s => (s || '').replace(/_/g, ' ');

  return (
    <div className="rp-root">
      <canvas ref={canvasRef} className="rp-confetti" />
      <div className="rp-container">

        {/* Health warning */}
        {healthWarning && (
          <div className="rp-health-warning">
            <div className="rp-hw-icon">⚠️</div>
            <div className="rp-hw-content">
              <h4>Health Advisory</h4>
              <p>{healthWarning}</p>
              <p className="rp-hw-note">Always consult a doctor before starting a new physical activity.</p>
            </div>
          </div>
        )}

        {/* SECTION 1: Hero — Hobby + Role */}
        <div className="rp-hero" style={{ borderColor: `${colors.from}44` }}>
          <div className="rp-hero-icon">{icon}</div>
          <p className="rp-main-label">Your Main Hobby</p>
          <div className="rp-badges">
            <div className="rp-category-badge" style={{ background: `${colors.from}22`, color: colors.from }}>{category}</div>
            {role && <div className="rp-role-badge" style={{ background: `${colors.to}22`, color: colors.to }}>🎭 {role}</div>}
          </div>
          <h1 className="rp-hobby-name">{fmt(hobby)}</h1>
          <p className="rp-desc">{desc}</p>
        </div>

        {/* SECTION 2: Why This Hobby? */}
        {reason && (
          <div className="rp-section rp-reason-section">
            <div className="rp-section-header">
              <span className="rp-section-icon">💡</span>
              <h3>Why This Hobby?</h3>
            </div>
            <p className="rp-reason-text">{reason}</p>
          </div>
        )}

        {/* SECTION 3: Improvement Suggestions */}
        {improvements.length > 0 && (
          <div className="rp-section rp-improve-section">
            <div className="rp-section-header">
              <span className="rp-section-icon">📈</span>
              <h3>Improvement Suggestions</h3>
            </div>
            <ul className="rp-improve-list">
              {improvements.map((tip, i) => (
                <li key={i}>
                  <span className="rp-improve-num">{i + 1}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SECTION 4: Career Path Mapping */}
        {careers.length > 0 && (
          <div className="rp-section rp-career-section">
            <div className="rp-section-header">
              <span className="rp-section-icon">🚀</span>
              <h3>Career Path Mapping</h3>
            </div>
            <div className="rp-career-grid">
              {careers.map((c, i) => (
                <div key={i} className="rp-career-card" style={{ borderColor: `${colors.from}33` }}>
                  <h4 className="rp-career-title" style={{ color: colors.from }}>{c.title}</h4>
                  <div className="rp-career-path">
                    {c.path.split('→').map((step, j, arr) => (
                      <span key={j} className="rp-career-step">
                        {step.trim()}{j < arr.length - 1 && <span className="rp-career-arrow">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secondary hobbies */}
        {alts.length > 0 && (
          <div className="rp-section rp-secondary">
            <div className="rp-section-header">
              <span className="rp-section-icon">🎯</span>
              <h3>Other Hobby Suggestions</h3>
            </div>
            <p className="rp-secondary-subtitle">Based on their answers across all categories</p>
            <div className="rp-secondary-grid">
              {alts.slice(0, 3).map((alt, i) => {
                const ac = CAT_COLORS[alt.category] || { from:'#6366f1' };
                return (
                  <div key={i} className="rp-sec-card" style={{ borderColor: `${ac.from}33` }}>
                    <span className="rp-sec-icon">{alt.icon || '⭐'}</span>
                    <div className="rp-sec-info">
                      <span className="rp-sec-hobby">{fmt(alt.hobby)}</span>
                      <span className="rp-sec-cat" style={{ color: ac.from }}>{alt.category}</span>
                      {alt.health_warning && <span className="rp-sec-health-flag">⚠️ Play with care</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="rp-actions">
          <button className="rp-btn rp-btn-primary" onClick={() => navigate('/predict')}>Try Again</button>
          <button className="rp-btn rp-btn-secondary" onClick={() => navigate('/history')}>View History</button>
          <button className="rp-btn rp-btn-secondary" onClick={() => navigate('/feedback', { state: { predictionId: prediction.id } })}>Give Feedback</button>
        </div>
      </div>
    </div>
  );
}
