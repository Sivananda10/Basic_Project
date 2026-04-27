import { useState } from 'react';
import { submitContact } from '../api/predictionApi';

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [msg, setMsg]         = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await submitContact(form);
      setMsg({ type: 'success', text: data.message || 'Message sent! We\'ll get back to you within 24 hours.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to send message.' });
    } finally { setLoading(false); }
  };

  const FAQS = [
    { q: 'Is the service really free?', a: 'Yes, 100%. HobbyPredictor is an academic project and is completely free to use. No credit card required.' },
    { q: "Is my child's data stored?", a: 'Input data is stored only to show your prediction history. It is never shared with third parties.' },
    { q: 'How accurate is the prediction?', a: 'Our Random Forest model achieves 92.5% accuracy on the test set. Confidence scores are shown with each result.' },
    { q: 'What age range is supported?', a: 'The model is trained on children aged 5 to 12 years and works best within that range.' },
  ];

  return (
    <>
      <style>{`
        .ct-hero {
          background:linear-gradient(135deg,#06061a 0%,#0d0d22 60%,#050510 100%);
          padding:80px 0 70px; position:relative; overflow:hidden;
        }
        .ct-hero::before {
          content:''; position:absolute; width:550px; height:550px; border-radius:50%;
          background:radial-gradient(circle,rgba(247,37,133,.18),transparent 65%);
          bottom:-20%; right:-8%; filter:blur(70px); pointer-events:none;
        }
        .ct-page-tag {
          display:inline-block; padding:5px 16px; border-radius:99px;
          font-size:.75rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
          border:1px solid rgba(247,37,133,.3); background:rgba(247,37,133,.08); color:#ff7daf; margin-bottom:16px;
        }
        .ct-page-title { font-size:clamp(2rem,4vw,3rem); font-weight:800; color:#fff; letter-spacing:-.8px; margin-bottom:14px; }
        .ct-page-desc  { font-size:1.05rem; color:#8888a8; max-width:520px; line-height:1.75; }
        .ct-section { padding:80px 0; background:#f9fafb; }
        .ct-layout { display:grid; grid-template-columns:7fr 5fr; gap:60px; align-items:flex-start; }
        @media(max-width:900px){ .ct-layout { grid-template-columns:1fr; } }
        .ct-form-card { background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:24px; padding:44px 40px; box-shadow:0 8px 40px rgba(0,0,0,.06); }
        @media(max-width:480px){ .ct-form-card { padding:28px 22px; } }
        .ct-form-title { font-size:1.4rem; font-weight:800; color:#1a1a2e; margin-bottom:6px; }
        .ct-form-sub   { font-size:.88rem; color:#9ca3af; margin-bottom:28px; }
        .ct-label { font-size:.8rem; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.8px; margin-bottom:6px; display:block; }
        .ct-input {
          width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid #e5e7eb; background:#fafbff;
          font-family:'Poppins',sans-serif; font-size:.9rem; color:#1a1a2e; transition:all .25s; outline:none;
        }
        .ct-input:focus { border-color:#4361ee; box-shadow:0 0 0 4px rgba(67,97,238,.1); background:#fff; }
        textarea.ct-input { resize:vertical; min-height:130px; }
        .ct-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        @media(max-width:480px){ .ct-row-2 { grid-template-columns:1fr; } }
        .ct-mb { margin-bottom:14px; }
        .ct-submit {
          display:inline-flex; align-items:center; gap:9px; padding:14px 36px; border-radius:13px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#4361ee,#7c3aed); color:#fff; font-family:'Poppins',sans-serif; font-size:.95rem; font-weight:700;
          box-shadow:0 8px 28px rgba(67,97,238,.3); transition:all .3s cubic-bezier(.16,1,.3,1); width:100%; justify-content:center;
        }
        .ct-submit:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(67,97,238,.38); }
        .ct-submit:disabled { opacity:.65; cursor:not-allowed; transform:none; }
        .ct-success { background:#d1fae5; color:#065f46; border-radius:12px; padding:14px 18px; margin-bottom:20px; font-size:.88rem; font-weight:500; display:flex; align-items:center; gap:8px; }
        .ct-error   { background:#fee2e2; color:#b91c1c; border-radius:12px; padding:14px 18px; margin-bottom:20px; font-size:.88rem; font-weight:500; }
        .ct-info-card {
          background:#fff; border:1px solid rgba(0,0,0,.06); border-radius:18px; padding:22px 22px;
          box-shadow:0 4px 20px rgba(0,0,0,.04); display:flex; align-items:flex-start; gap:16px;
          transition:all .35s;
        }
        .ct-info-card:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(67,97,238,.08); border-color:rgba(67,97,238,.14); }
        .ct-info-icon { width:48px; height:48px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.2rem; }
        .ct-info-title { font-size:.9rem; font-weight:700; color:#1a1a2e; margin-bottom:4px; }
        .ct-info-val   { font-size:.82rem; color:#6b7280; }
        .ct-info-stack { display:flex; flex-direction:column; gap:12px; margin-bottom:32px; }
        .ct-faq-title  { font-size:1rem; font-weight:800; color:#1a1a2e; letter-spacing:-.2px; margin-bottom:16px; }
        .ct-faq-item {
          border:1px solid rgba(0,0,0,.06); border-radius:14px; padding:18px 20px;
          background:#fff; cursor:pointer; transition:all .3s; margin-bottom:10px; user-select:none;
        }
        .ct-faq-item:hover { border-color:rgba(67,97,238,.2); box-shadow:0 4px 18px rgba(67,97,238,.06); }
        .ct-faq-item.open  { border-color:rgba(67,97,238,.25); }
        .ct-faq-q { font-size:.92rem; font-weight:700; color:#1a1a2e; display:flex; justify-content:space-between; align-items:center; }
        .ct-faq-a { font-size:.84rem; color:#6b7280; line-height:1.65; margin-top:10px; }
      `}</style>

      {/* Hero */}
      <div className="ct-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="ct-page-tag">Contact</span>
          <h1 className="ct-page-title">We'd Love to<br />Hear From You</h1>
          <p className="ct-page-desc">Questions, feedback, or just want to say hi? Send us a message and we'll respond as quickly as we can.</p>
        </div>
      </div>

      {/* Main section */}
      <section className="ct-section">
        <div className="container">
          <div className="ct-layout">

            {/* Form */}
            <div className="ct-form-card">
              <h3 className="ct-form-title">Send a Message</h3>
              <p className="ct-form-sub">Fill out the form below and we'll get back to you within 24 hours.</p>

              {msg.text && (
                <div className={msg.type === 'success' ? 'ct-success' : 'ct-error'}>
                  {msg.type === 'success' && <i className="bi bi-check-circle" />}
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="ct-row-2">
                  <div>
                    <label className="ct-label" htmlFor="ct-name">Full Name</label>
                    <input className="ct-input" type="text" id="ct-name" placeholder="Your name"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="ct-label" htmlFor="ct-email">Email Address</label>
                    <input className="ct-input" type="email" id="ct-email" placeholder="you@example.com"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="ct-mb">
                  <label className="ct-label" htmlFor="ct-subject">Subject</label>
                  <input className="ct-input" type="text" id="ct-subject" placeholder="What's this about?"
                    value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="ct-mb">
                  <label className="ct-label" htmlFor="ct-message">Message</label>
                  <textarea className="ct-input" id="ct-message" placeholder="Tell us anything…"
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
                <button type="submit" className="ct-submit" disabled={loading}>
                  <i className="bi bi-send" /> {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Info + FAQ */}
            <div>
              <div className="ct-info-stack">
                <div className="ct-info-card">
                  <div className="ct-info-icon" style={{ background: 'rgba(67,97,238,.08)', color: '#4361ee', border: '1px solid rgba(67,97,238,.12)' }}>
                    <i className="bi bi-envelope" />
                  </div>
                  <div>
                    <div className="ct-info-title">Email Us</div>
                    <div className="ct-info-val">support@hobbypredictor.in</div>
                  </div>
                </div>
                <div className="ct-info-card">
                  <div className="ct-info-icon" style={{ background: 'rgba(6,214,160,.08)', color: '#06d6a0', border: '1px solid rgba(6,214,160,.12)' }}>
                    <i className="bi bi-clock" />
                  </div>
                  <div>
                    <div className="ct-info-title">Response Time</div>
                    <div className="ct-info-val">Usually within 24 hours on weekdays</div>
                  </div>
                </div>
                <div className="ct-info-card">
                  <div className="ct-info-icon" style={{ background: 'rgba(247,37,133,.08)', color: '#f72585', border: '1px solid rgba(247,37,133,.12)' }}>
                    <i className="bi bi-github" />
                  </div>
                  <div>
                    <div className="ct-info-title">Open Source</div>
                    <div className="ct-info-val">This is an academic project — contributions welcome!</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="ct-faq-title">Frequently Asked Questions</h4>
                {FAQS.map((faq, i) => (
                  <div key={i}
                    className={`ct-faq-item${openFaq === i ? ' open' : ''}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div className="ct-faq-q">
                      {faq.q}
                      <i className={`bi bi-chevron-${openFaq === i ? 'up' : 'down'}`} style={{ fontSize: '.85rem', color: '#9ca3af' }} />
                    </div>
                    {openFaq === i && <div className="ct-faq-a">{faq.a}</div>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
