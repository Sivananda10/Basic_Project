import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitPrediction as apiSubmit } from '../api/predictionApi';
import { STEP_DEFS, SECTION_DEFAULTS, GLOBAL_DEFAULTS, AGREE_SET, likertToML, likertToLevel } from './stepDefs_v5';
import './PredictPage.css';

// Likert gate features → section mapping
const LIKERT_GATES = {
  likes_sports:     'sports',
  likes_arts:       'arts',
  likes_analytical: 'analytical',
  likes_cooking:    'cooking',
  likes_gardening:  'gardening',
};

function buildStepSequence(answers) {
  const skippedSections = new Set();

  // Likert-gated sections: only open on Agree / Strongly Agree
  for (const [feature, section] of Object.entries(LIKERT_GATES)) {
    const val = answers[feature];
    if (val && !AGREE_SET.has(val)) skippedSections.add(section);
  }

  // Binary gate for previous hobby
  if (answers.tried_hobby_before === 'No') skippedSections.add('prev_hobby');

  return STEP_DEFS.filter(step => {
    if (step.section && skippedSections.has(step.section)) return false;
    if (step.showIf && !step.showIf(answers)) return false;
    return true;
  });
}

export default function PredictPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animClass, setAnimClass] = useState('anim-enter');

  const visibleSteps = buildStepSequence(answers);
  const step = visibleSteps[stepIdx];
  const isLast = stepIdx === visibleSteps.length - 1;
  const progressPct = Math.round((stepIdx / Math.max(visibleSteps.length - 1, 1)) * 100);

  function handleAnswer(feature, value) {
    setAnswers(prev => {
      const next = { ...prev, [feature]: value };
      if (feature === 'sport_indoor_outdoor') delete next.which_sport;

      // Binary gate handling
      const q = step?.questions?.find(q => q.feature === feature);
      if (q?.type === 'gate' && value === 'No' && q.gateSkipsSection) {
        Object.assign(next, SECTION_DEFAULTS[q.gateSkipsSection] || {});
      }
      if (q?.type === 'gate' && value === 'Yes' && q.gateSkipsSection) {
        Object.keys(SECTION_DEFAULTS[q.gateSkipsSection] || {}).forEach(k => { delete next[k]; });
      }

      // Likert gate handling
      if (q?.type === 'likert' && LIKERT_GATES[feature]) {
        if (!AGREE_SET.has(value)) {
          Object.assign(next, SECTION_DEFAULTS[LIKERT_GATES[feature]] || {});
        } else {
          Object.keys(SECTION_DEFAULTS[LIKERT_GATES[feature]] || {}).forEach(k => { delete next[k]; });
        }
      }
      return next;
    });
  }

  function isStepComplete() {
    if (!step) return false;
    return step.questions.every(q => {
      if (answers[q.feature] === undefined) return false;
      if (q.allowOther && answers[q.feature] === 'Other') {
        return !!(answers[q.feature + '_custom'] || '').trim();
      }
      if (q.dynamicOptions) {
        return q.dynamicOptions(answers).some(o => o.value === answers[q.feature]);
      }
      return true;
    });
  }

  function transition(newIdx) {
    setAnimClass('anim-exit');
    setTimeout(() => {
      setStepIdx(newIdx);
      setAnimClass('anim-enter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }

  function handleNext() {
    if (!isStepComplete()) return;
    if (isLast) { submitPrediction(); return; }
    transition(stepIdx + 1);
  }

  function handleBack() {
    if (stepIdx === 0) return;
    transition(stepIdx - 1);
  }

  async function submitPrediction() {
    setLoading(true); setError('');
    try {
      const payload = { ...GLOBAL_DEFAULTS, ...answers };

      // Map Likert → binary Yes/No for ML gate features
      for (const feat of Object.keys(LIKERT_GATES)) {
        payload[feat] = likertToML(payload[feat]);
      }

      // Map Likert → Level for intensity features
      const levelFeats = ['sport_hours_per_day','art_creativity','art_performance',
        'analy_logic_level',
        'analy_coding_interest','analy_patience_level','health_energy',
        'emotional_engagement','game_design_interest'];
      for (const feat of levelFeats) {
        if (AGREE_SET.has(payload[feat]) || ['Neutral','Disagree','Strongly Disagree'].includes(payload[feat])) {
          payload[feat] = likertToLevel(payload[feat]);
        }
      }

      // Derive personality traits
      const whom = payload.activity_with_whom || 'Mixed';
      const team = payload.sport_team_solo || 'Individual';
      if (whom === 'Alone' && team === 'Individual') payload.personality_type = 'Introvert';
      else if (whom === 'With Friends' || whom === 'Mixed' || team === 'Team') payload.personality_type = 'Extrovert';
      else payload.personality_type = 'Ambivert';

      // Creativity score
      payload.creativity_score = payload.art_creativity === 'High' ? '8' : '5';
      // Leadership
      payload.leadership_tendency = team === 'Team' ? 'High' : 'Medium';
      // Attention span
      payload.attention_span = payload.analy_patience_level === 'High' ? 'Long' : 'Medium';

      // Fix game_design_interest back to Yes/No for ML
      if (payload.game_design_interest === 'High') payload.game_design_interest = 'Yes';
      else if (payload.game_design_interest === 'Medium') payload.game_design_interest = 'Yes';
      else if (['Low','None'].includes(payload.game_design_interest)) payload.game_design_interest = 'No';

      const res = await apiSubmit(payload);
      navigate('/result', { state: { prediction: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="qz-loading">
        <div className="qz-spinner" />
        <h2>Analysing your child's profile…</h2>
        <p className="sub">Finding the perfect hobby match ✨</p>
      </div>
    );
  }

  const LIKERT_COLORS = {
    'Strongly Agree':    '#22c55e',
    'Agree':             '#86efac',
    'Neutral':           '#94a3b8',
    'Disagree':          '#fb923c',
    'Strongly Disagree': '#ef4444',
  };

  return (
    <div className="qz-page">
      {stepIdx === 0 && (
        <div className="qz-intro">
          <h1>Discover Your Child's<br /><span>Perfect Hobby</span></h1>
          <p>
            Answer <strong>adaptive questions</strong> about your child across
            Sports, Arts, Analytical Thinking, Cooking, Gardening, Digital & Health.
          </p>
          <div className="qz-meta">
            <span className="qz-meta-item">~4 min</span>
            <span className="qz-meta-sep" />
            <span className="qz-meta-item">{visibleSteps.length} Steps</span>
            <span className="qz-meta-sep" />
            <span className="qz-meta-item">25+ Hobbies</span>
          </div>
        </div>
      )}

      <div className={`qz-card ${animClass}`}>
        <div className="qz-header">
          <div className="qz-progress-bar">
            <div className="qz-progress-fill" style={{ width: `${progressPct}%`, background: step?.color }} />
          </div>
          <div className="qz-section-label">
            <span className="qz-section-name" style={{ color: step?.color }}>{step?.title}</span>
            <span className="qz-step-counter">Step {stepIdx + 1} / {visibleSteps.length}</span>
          </div>
        </div>

        <div className="qz-body">
          {step?.questions.map((q) => {
            const resolvedOptions = q.dynamicOptions ? q.dynamicOptions(answers) : q.options;
            const questionText = q.dynamicText ? q.dynamicText(answers) : q.text;
            const currentVal = answers[q.feature];

            return (
              <div key={q.feature} className="qz-block">
                <div className="qz-question">
                  {questionText}
                  {q.hint && <span className="qz-hint">{q.hint}</span>}
                </div>

                {/* LIKERT SCALE */}
                {q.type === 'likert' ? (
                  <div className="qz-likert">
                    {resolvedOptions.map(opt => {
                      const isActive = currentVal === opt.value;
                      const color = LIKERT_COLORS[opt.value];
                      return (
                        <button key={opt.value}
                          className={`qz-likert-btn ${isActive ? 'active' : ''}`}
                          style={isActive ? { borderColor: color, background: `${color}18`, color: color } : {}}
                          onClick={() => handleAnswer(q.feature, opt.value)}>
                          <span className="qz-likert-dot" style={isActive ? { background: color, boxShadow: `0 0 8px ${color}44` } : {}} />
                          <span className="qz-likert-label">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) :

                /* AGE SCALE */
                q.type === 'scale' ? (
                  <div className="qz-scale">
                    {resolvedOptions.map(opt => (
                      <button key={opt.value}
                        className={`qz-scale-btn ${currentVal === opt.value ? 'active' : ''}`}
                        style={currentVal === opt.value ? { background: step.color, borderColor: step.color } : {}}
                        onClick={() => handleAnswer(q.feature, opt.value)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) :

                /* STANDARD OPTIONS */
                (
                  <div className="qz-options">
                    {resolvedOptions.map(opt => (
                      <button key={opt.value}
                        className={`qz-opt ${currentVal === opt.value ? 'selected' : ''}`}
                        style={currentVal === opt.value ? { borderColor: step.color, background: `${step.color}12` } : {}}
                        onClick={() => handleAnswer(q.feature, opt.value)}>
                        <span className="qz-opt-radio"
                          style={currentVal === opt.value ? { borderColor: step.color, background: step.color } : {}} />
                        <span className="qz-opt-label">{opt.label}</span>
                      </button>
                    ))}
                    {q.allowOther && currentVal === 'Other' && (
                      <input className="qz-other-input" type="text" placeholder="Please specify…"
                        value={answers[q.feature + '_custom'] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.feature + '_custom']: e.target.value }))} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="qz-error">{error}</p>}

        <div className="qz-footer">
          {stepIdx > 0 && (
            <button className="qz-btn qz-btn-back" onClick={handleBack}>← Back</button>
          )}
          <button className="qz-btn qz-btn-next"
            disabled={!isStepComplete()}
            style={isStepComplete() ? { background: step?.color } : {}}
            onClick={handleNext}>
            {isLast ? '🎯 Get Results' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
