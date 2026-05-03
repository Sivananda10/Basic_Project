import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { submitFeedback } from '../api/predictionApi';

export default function FeedbackPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ is_accurate: '', comments: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.is_accurate) { setError('Please select whether the prediction was accurate.'); return; }
    setLoading(true);
    setError('');
    try {
      await submitFeedback(id, { ...form, is_accurate: form.is_accurate === 'true' });
      setSubmitted(true);
      setTimeout(() => navigate('/history'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback. This prediction may already have feedback.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .fb-page { background:#f9fafb; min-height:100vh; display:flex; align-items:center; padding:60px 20px; }
        .fb-card { background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:24px; padding:44px 40px; box-shadow:0 8px 40px rgba(0,0,0,.07); width:100%; max-width:560px; margin:0 auto; }
        @media(max-width:480px){ .fb-card { padding:28px 22px; } }
        .fb-head { text-align:center; margin-bottom:30px; }
        .fb-icon { font-size:3rem; color:#4361ee; display:block; margin-bottom:16px; }
        .fb-head h3 { font-size:1.4rem; font-weight:800; color:#1a1a2e; margin-bottom:8px; }
        .fb-head p  { font-size:.9rem; color:#6b7280; }
        .fb-label { font-size:.82rem; font-weight:700; color:#374151; margin-bottom:10px; display:block; }
        .fb-opts  { display:flex; gap:12px; margin-bottom:20px; }
        .fb-opt {
          flex:1; border-radius:14px; border:2px solid #e5e7eb; padding:16px 12px; cursor:pointer;
          text-align:center; transition:all .25s; font-family:'Poppins',sans-serif; font-size:.88rem;
          font-weight:600; background:#fff; display:flex; align-items:center; justify-content:center; gap:8px;
          color:#374151;
        }
        .fb-opt:hover { border-color:rgba(67,97,238,.35); }
        .fb-opt.selected-yes  { border-color:#06d6a0; background:rgba(6,214,160,.08); color:#065f46; }
        .fb-opt.selected-no   { border-color:#f72585; background:rgba(247,37,133,.08); color:#9d174d; }
        .fb-textarea {
          width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid #e5e7eb; background:#fafbff;
          font-family:'Poppins',sans-serif; font-size:.9rem; color:#1a1a2e;
          transition:all .25s; outline:none; resize:vertical; min-height:110px; margin-bottom:20px;
        }
        .fb-textarea:focus { border-color:#4361ee; box-shadow:0 0 0 4px rgba(67,97,238,.1); background:#fff; }
        .fb-actions { display:flex; gap:12px; }
        .fb-cancel {
          flex:1; padding:13px; border-radius:12px; border:1.5px solid #e5e7eb;
          background:#f4f6fb; color:#374151; font-family:'Poppins',sans-serif;
          font-size:.9rem; font-weight:700; cursor:pointer; text-align:center;
          text-decoration:none; display:flex; align-items:center; justify-content:center;
          transition:all .25s;
        }
        .fb-cancel:hover { background:#fff; border-color:#c7d2fc; color:#4361ee; }
        .fb-submit {
          flex:2; padding:13px; border-radius:12px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#4361ee,#7c3aed); color:#fff;
          font-family:'Poppins',sans-serif; font-size:.9rem; font-weight:700;
          box-shadow:0 6px 24px rgba(67,97,238,.3); transition:all .3s cubic-bezier(.16,1,.3,1);
        }
        .fb-submit:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(67,97,238,.4); }
        .fb-submit:disabled { opacity:.65; cursor:not-allowed; transform:none; }
        .fb-error { background:#fee2e2; color:#b91c1c; border-radius:12px; padding:12px 16px; margin-bottom:18px; font-size:.85rem; font-weight:500; display:flex; align-items:center; gap:8px; }
        .fb-mb { margin-bottom:16px; }
        .fb-success { text-align:center; padding:32px 0; }
        .fb-success-icon { font-size:4rem; display:block; margin-bottom:16px; }
        .fb-success h3 { font-size:1.3rem; font-weight:800; color:#065f46; margin-bottom:8px; }
        .fb-success p  { font-size:.88rem; color:#6b7280; }
        .fb-no-id { text-align:center; padding:40px 20px; }
        .fb-no-id h3 { font-size:1.2rem; font-weight:700; color:#1a1a2e; margin-bottom:12px; }
        .fb-no-id p  { color:#6b7280; font-size:.9rem; margin-bottom:24px; }
        .fb-id-badge { display:inline-block; padding:4px 12px; border-radius:99px; background:rgba(67,97,238,.08);
          color:#4361ee; font-size:.76rem; font-weight:700; margin-bottom:8px; }
      `}</style>

      <div className="fb-page">
        <div style={{ width: '100%' }}>
          <div className="fb-card">

            {/* ── No prediction ID ── */}
            {!id ? (
              <div className="fb-no-id">
                <i className="bi bi-exclamation-circle" style={{fontSize:'3rem',color:'#f72585',display:'block',marginBottom:'16px'}} />
                <h3>No Prediction Selected</h3>
                <p>Please go to your history and click <strong>💬 Feedback</strong> on a prediction to rate it.</p>
                <Link to="/history" className="fb-submit" style={{display:'inline-flex',textDecoration:'none',padding:'12px 28px'}}>
                  Go to History
                </Link>
              </div>

            /* ── Submission success ── */
            ) : submitted ? (
              <div className="fb-success">
                <span className="fb-success-icon">🎉</span>
                <h3>Thank you for your feedback!</h3>
                <p>Your response helps improve our predictions.<br/>Redirecting to history…</p>
              </div>

            /* ── Feedback form ── */
            ) : (
              <>
                <div className="fb-head">
                  <i className="bi bi-chat-dots-fill fb-icon" />
                  <span className="fb-id-badge">Prediction #{id}</span>
                  <h3>Give Feedback</h3>
                  <p>Help us improve by rating the accuracy of our AI prediction for your child.</p>
                </div>

                {error && (
                  <div className="fb-error">
                    <i className="bi bi-exclamation-circle" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <label className="fb-label">Was the prediction accurate?</label>
                  <div className="fb-opts">
                    <button type="button"
                      className={`fb-opt${form.is_accurate === 'true' ? ' selected-yes' : ''}`}
                      onClick={() => setForm({ ...form, is_accurate: 'true' })}>
                      <i className="bi bi-hand-thumbs-up" /> Yes, accurate
                    </button>
                    <button type="button"
                      className={`fb-opt${form.is_accurate === 'false' ? ' selected-no' : ''}`}
                      onClick={() => setForm({ ...form, is_accurate: 'false' })}>
                      <i className="bi bi-hand-thumbs-down" /> No, not accurate
                    </button>
                  </div>

                  <div className="fb-mb">
                    <label className="fb-label" htmlFor="fb-comments">Comments (optional)</label>
                    <textarea className="fb-textarea" id="fb-comments"
                      placeholder="Any additional thoughts about the prediction…"
                      value={form.comments}
                      onChange={e => setForm({ ...form, comments: e.target.value })}
                    />
                  </div>

                  <div className="fb-actions">
                    <Link to="/history" className="fb-cancel">Cancel</Link>
                    <button type="submit" className="fb-submit" disabled={loading}>
                      <i className="bi bi-send" style={{marginRight:'6px'}}/>{loading ? 'Submitting…' : 'Submit Feedback'}
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
