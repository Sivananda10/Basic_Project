import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveFollowup } from '../api/predictionApi';
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

// Hobby-specific follow-up questions (3 per hobby)
const HOBBY_FOLLOWUP = {
  Cricket: [
    { id:'fq_cricket_role', q:'What role does your child prefer in Cricket?',
      opts:['Batting','Bowling','Wicket Keeping','All-rounder'] },
    { id:'fq_cricket_hand', q:'Right-handed or Left-handed?',
      opts:['Right-handed','Left-handed'] },
    { id:'fq_cricket_goal', q:'What is your child\'s cricket goal?',
      opts:['Play for school team','Play professionally','Just for fun','Represent state/country'] },
  ],
  Football: [
    { id:'fq_football_pos', q:'Preferred position on the field?',
      opts:['Forward / Striker','Midfielder','Defender','Goalkeeper'] },
    { id:'fq_football_foot', q:'Dominant foot?',
      opts:['Right foot','Left foot','Both feet equally'] },
    { id:'fq_football_style', q:'Playing style preference?',
      opts:['Attacking','Defensive','Balanced','Dribbling specialist'] },
  ],
  Badminton: [
    { id:'fq_badminton_type', q:'Singles or Doubles?',
      opts:['Singles','Doubles','Both'] },
    { id:'fq_badminton_hand', q:'Playing hand?',
      opts:['Right-handed','Left-handed'] },
    { id:'fq_badminton_style', q:'Preferred playing style?',
      opts:['Aggressive smashing','Defensive rallying','All-round play'] },
  ],
  Swimming: [
    { id:'fq_swim_stroke', q:'Favourite swimming stroke?',
      opts:['Freestyle','Backstroke','Breaststroke','Butterfly','All strokes'] },
    { id:'fq_swim_goal', q:'Swimming goal?',
      opts:['Competitive racing','Fitness','Water polo','Just leisure'] },
    { id:'fq_swim_training', q:'Training frequency preference?',
      opts:['Daily','3-4 days/week','Weekends only'] },
  ],
  Chess: [
    { id:'fq_chess_style', q:'Preferred chess time format?',
      opts:['Blitz (fast)','Rapid','Classical (long)','Online only'] },
    { id:'fq_chess_focus', q:'Favourite phase of the game?',
      opts:['Opening theory','Middlegame tactics','Endgame technique','All phases'] },
    { id:'fq_chess_goal', q:'Chess goal?',
      opts:['Beat friends/family','Tournament play','Online ranking','FIDE rating'] },
  ],
  Singing: [
    { id:'fq_singing_genre', q:'What genre does your child enjoy singing?',
      opts:['Classical','Bollywood / Film songs','Western Pop','Folk','Carnatic / Hindustani'] },
    { id:'fq_singing_stage', q:'Stage comfort level?',
      opts:['Loves performing on stage','Comfortable in small groups','Prefers recording / home','Still building confidence'] },
    { id:'fq_singing_training', q:'Type of training preferred?',
      opts:['Formal music teacher','Online lessons','Self-taught / YouTube','Group classes'] },
  ],
  Music: [
    { id:'fq_music_type', q:'Vocals or Instrument?',
      opts:['Vocals / Singing','String instrument (Guitar, Violin)','Keyboard / Piano','Percussion (Drums, Tabla)','Wind instrument','Both vocals & instrument'] },
    { id:'fq_music_genre', q:'Music genre preference?',
      opts:['Classical','Bollywood / Film','Western Pop / Rock','Jazz','Folk / Traditional'] },
    { id:'fq_music_goal', q:'Music goal?',
      opts:['Perform on stage','Record songs','Just a hobby','Professional musician'] },
  ],
  Dance: [
    { id:'fq_dance_style', q:'Preferred dance style?',
      opts:['Classical (Bharatanatyam, Kuchipudi)','Western (Hip-hop, Contemporary)','Folk','Bollywood','Ballet'] },
    { id:'fq_dance_solo', q:'Solo or group performances?',
      opts:['Solo','Group','Both'] },
    { id:'fq_dance_goal', q:'Dance goal?',
      opts:['School/stage performances','Competitions','Professional dancer','Just fitness & fun'] },
  ],
  Drawing: [
    { id:'fq_art_medium', q:'Preferred drawing medium?',
      opts:['Pencil sketch','Watercolour painting','Oil paints','Digital art','Charcoal / Pastel'] },
    { id:'fq_art_subject', q:'What does your child love to draw?',
      opts:['People / Portraits','Nature / Landscapes','Cartoons / Anime','Abstract','Animals'] },
    { id:'fq_art_goal', q:'Art goal?',
      opts:['Display in school exhibitions','Social media / portfolio','Pursue art professionally','Just for relaxation'] },
  ],
  Coding: [
    { id:'fq_code_lang', q:'Programming interest area?',
      opts:['Web development','Game development','App development','AI / Machine Learning','Competitive programming'] },
    { id:'fq_code_experience', q:'Current experience level?',
      opts:['Complete beginner','Knows basics (Scratch/Python)','Intermediate','Advanced'] },
    { id:'fq_code_goal', q:'Coding goal?',
      opts:['Build a personal project','Win hackathons','Career in tech','Academic projects'] },
  ],
  Yoga: [
    { id:'fq_yoga_type', q:'Type of yoga preferred?',
      opts:['Hatha (gentle)','Ashtanga (vigorous)','Power Yoga','Yin / Restorative','Kids Yoga'] },
    { id:'fq_yoga_focus', q:'Primary focus?',
      opts:['Flexibility','Stress relief','Strength','Balance','Meditation & mindfulness'] },
    { id:'fq_yoga_freq', q:'Practice frequency?',
      opts:['Daily','4-5 days/week','Weekends','Occasional'] },
  ],
  Cooking: [
    { id:'fq_cook_type', q:'What does your child enjoy cooking?',
      opts:['Baking (cakes, cookies)','Indian curries','Continental dishes','Snacks & street food','Smoothies & drinks'] },
    { id:'fq_cook_style', q:'Cooking style?',
      opts:['Follows recipes exactly','Loves experimenting','Quick & easy recipes','Elaborate multi-step dishes'] },
    { id:'fq_cook_goal', q:'Cooking goal?',
      opts:['Cook for family','Start a food blog','Become a professional chef','Just a fun hobby'] },
  ],
  Gardening: [
    { id:'fq_garden_type', q:'What to grow?',
      opts:['Vegetables & herbs','Flowers','Succulents / Indoor plants','Fruit trees','Mixed garden'] },
    { id:'fq_garden_space', q:'Available gardening space?',
      opts:['Large garden','Small backyard','Balcony / Terrace','Indoor only','School garden'] },
    { id:'fq_garden_goal', q:'Gardening goal?',
      opts:['Grow own food','Beautify the home','Environmental awareness','Compete in shows'] },
  ],
};

// Fallback 3 generic questions for hobbies without specific definitions
const GENERIC_FOLLOWUP = [
  { id:'fq_gen_time', q:'How much time can your child dedicate to this hobby per week?',
    opts:['Less than 2 hours','2-5 hours','5-10 hours','10+ hours'] },
  { id:'fq_gen_goal', q:'What is the main goal for pursuing this hobby?',
    opts:['Just for fun / relaxation','To compete / win','Build a career','Social activity with friends'] },
  { id:'fq_gen_training', q:'What type of guidance would you prefer?',
    opts:['Formal coaching / classes','Self-learning / YouTube','School or club-based','One-on-one tutor'] },
];

function getFollowupQuestions(hobby) {
  // Check for partial match (e.g. "Cricket_Batting" → Cricket)
  for (const key of Object.keys(HOBBY_FOLLOWUP)) {
    if (hobby && hobby.toLowerCase().includes(key.toLowerCase())) {
      return HOBBY_FOLLOWUP[key];
    }
  }
  return GENERIC_FOLLOWUP;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;
  const canvasRef = useRef(null);

  const [followupAnswers, setFollowupAnswers] = useState({});
  const [followupSubmitted, setFollowupSubmitted] = useState(false);
  const [followupSaving, setFollowupSaving] = useState(false);
  const [followupError, setFollowupError] = useState('');

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

  const followupQuestions = getFollowupQuestions(hobby);
  const allFollowupAnswered = followupQuestions.every(fq => followupAnswers[fq.id]);

  async function handleSubmitFollowup() {
    if (!allFollowupAnswered) return;
    setFollowupSaving(true); setFollowupError('');
    try {
      await saveFollowup(prediction.id, followupAnswers);
      setFollowupSubmitted(true);
    } catch {
      setFollowupError('Could not save answers. You can continue without saving.');
      setFollowupSubmitted(true); // Still allow proceeding
    } finally {
      setFollowupSaving(false);
    }
  }

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

        {/* SECTION 2: Why This Hobby? + 3 Follow-up questions */}
        {reason && (
          <div className="rp-section rp-reason-section">
            <div className="rp-section-header">
              <span className="rp-section-icon">💡</span>
              <h3>Why This Hobby?</h3>
            </div>
            <p className="rp-reason-text">{reason}</p>

            {/* ── Follow-up Questions ── */}
            {!followupSubmitted ? (
              <div className="rp-fq-wrap">
                {/* Header */}
                <div className="rp-fq-header">
                  <div className="rp-fq-header-left">
                    <span className="rp-fq-tag">Quick Check-In</span>
                    <h4 className="rp-fq-title">Tell us more about <span style={{ color: colors.from }}>{fmt(hobby)}</span></h4>
                    <p className="rp-fq-sub">3 questions · personalises your roadmap</p>
                  </div>
                  {/* Progress dots */}
                  <div className="rp-fq-dots">
                    {followupQuestions.map((fq, i) => (
                      <span key={i} className={`rp-fq-dot ${followupAnswers[fq.id] ? 'done' : ''}`}
                        style={followupAnswers[fq.id] ? { background: colors.from, borderColor: colors.from } : {}} />
                    ))}
                  </div>
                </div>

                {/* Question Cards */}
                <div className="rp-fq-questions">
                  {followupQuestions.map((fq, idx) => {
                    const answered = !!followupAnswers[fq.id];
                    return (
                      <div key={fq.id} className={`rp-fq-card ${answered ? 'rp-fq-card--done' : ''}`}
                        style={{ '--fq-color': colors.from, '--fq-color-to': colors.to }}>
                        {/* Step indicator */}
                        <div className="rp-fq-step">
                          {answered
                            ? <span className="rp-fq-step-check" style={{ background: colors.from }}>✓</span>
                            : <span className="rp-fq-step-num" style={{ background: `${colors.from}20`, color: colors.from, borderColor: `${colors.from}40` }}>{idx + 1}</span>
                          }
                          <span className="rp-fq-step-q">{fq.q}</span>
                        </div>
                        {/* Options grid */}
                        <div className="rp-fq-opts">
                          {fq.opts.map(opt => {
                            const sel = followupAnswers[fq.id] === opt;
                            return (
                              <button key={opt}
                                className={`rp-fq-opt ${sel ? 'rp-fq-opt--sel' : ''}`}
                                style={sel ? {
                                  borderColor: colors.from,
                                  background: `${colors.from}18`,
                                  color: colors.from,
                                  boxShadow: `0 0 0 3px ${colors.from}20`,
                                } : {}}
                                onClick={() => setFollowupAnswers(prev => ({ ...prev, [fq.id]: opt }))}>
                                <span className="rp-fq-radio"
                                  style={sel ? { background: colors.from, borderColor: colors.from } : {}} />
                                {opt}
                                {sel && <span className="rp-fq-tick">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                {followupError && <p className="rp-fq-error">{followupError}</p>}
                <div className="rp-fq-footer">
                  <span className="rp-fq-answered">
                    {Object.keys(followupAnswers).length} / {followupQuestions.length} answered
                  </span>
                  <button className="rp-fq-submit"
                    disabled={!allFollowupAnswered || followupSaving}
                    style={allFollowupAnswered ? {
                      background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                      boxShadow: `0 8px 24px ${colors.from}45`,
                    } : {}}
                    onClick={handleSubmitFollowup}>
                    {followupSaving
                      ? <><span className="rp-fq-spin" /> Saving…</>
                      : <>{allFollowupAnswered ? '🚀 Save & Personalise' : `Answer all ${followupQuestions.length} questions`}</>
                    }
                  </button>
                </div>
              </div>
            ) : (
              <div className="rp-fq-success" style={{ borderColor: `${colors.from}30`, background: `${colors.from}0a` }}>
                <div className="rp-fq-success-icon" style={{ background: `${colors.from}20`, color: colors.from }}>✓</div>
                <div>
                  <div className="rp-fq-success-title">Profile personalised!</div>
                  <div className="rp-fq-success-sub">Follow-up answers saved to your prediction history &amp; admin view.</div>
                </div>
              </div>
            )}
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
          <button className="rp-btn rp-btn-secondary" onClick={() => navigate(`/feedback/${prediction.id}`)}>Give Feedback</button>
        </div>
      </div>
    </div>
  );
}
