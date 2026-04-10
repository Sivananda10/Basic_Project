export default function AboutPage() {
  const CARDS = [
    { bg: 'linear-gradient(135deg,rgba(67,97,238,.1),rgba(67,97,238,.04))', color: '#4361ee', border: 'rgba(67,97,238,.15)', icon: 'bi-cpu',
      title: 'Random Forest AI',
      desc: 'Our core model uses ensemble learning with 5 algorithms evaluated in parallel, then selects the best-performing one for each prediction.' },
    { bg: 'linear-gradient(135deg,rgba(6,214,160,.1),rgba(6,214,160,.04))', color: '#06d6a0', border: 'rgba(6,214,160,.15)', icon: 'bi-shield-lock',
      title: 'Privacy First',
      desc: "No child's data is ever sold or shared. All inputs are processed securely, and user data stays within the platform." },
    { bg: 'linear-gradient(135deg,rgba(247,37,133,.1),rgba(247,37,133,.04))', color: '#f72585', border: 'rgba(247,37,133,.15)', icon: 'bi-lightning-charge',
      title: 'Instant Results',
      desc: 'Fill out 19 questions and receive a full prediction with confidence score and category breakdown in under 30 seconds.' },
    { bg: 'linear-gradient(135deg,rgba(255,209,102,.12),rgba(255,209,102,.04))', color: '#f4a300', border: 'rgba(255,209,102,.2)', icon: 'bi-bar-chart-line',
      title: '5 Hobby Domains',
      desc: 'Sports, Arts, Academics, Analytical Thinking, and Health & Fitness — a comprehensive taxonomy that covers every child\'s potential.' },
    { bg: 'linear-gradient(135deg,rgba(76,201,240,.1),rgba(76,201,240,.04))', color: '#4cc9f0', border: 'rgba(76,201,240,.15)', icon: 'bi-people',
      title: 'Parent-Centric',
      desc: 'Designed for parents, not just data scientists. Simple language, easy inputs, and clear outcomes — no technical knowledge needed.' },
    { bg: 'linear-gradient(135deg,rgba(124,58,237,.1),rgba(124,58,237,.04))', color: '#7c3aed', border: 'rgba(124,58,237,.15)', icon: 'bi-gift',
      title: 'Completely Free',
      desc: 'Every feature — predictions, history, feedback — is free. No subscription, no hidden charges, no paywalls.' },
  ];

  const STATS = [
    { val: '2500+', lbl: 'Training Records' },
    { val: '92.5%', lbl: 'Accuracy' },
    { val: '19', lbl: 'Parameters' },
    { val: '5', lbl: 'Hobby Domains' },
  ];

  return (
    <>
      <style>{`
        .ab-hero {
          background: linear-gradient(135deg, #06061a 0%, #0d0d22 60%, #050510 100%);
          padding: 80px 0 70px; position: relative; overflow: hidden;
        }
        .ab-hero::before {
          content:''; position:absolute; width:600px; height:600px; border-radius:50%;
          background:radial-gradient(circle,rgba(67,97,238,.2),transparent 65%);
          top:-20%; right:-10%; filter:blur(60px); pointer-events:none;
        }
        .ab-page-tag {
          display:inline-block; padding:5px 16px; border-radius:99px;
          font-size:.75rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
          border:1px solid rgba(67,97,238,.3); background:rgba(67,97,238,.1);
          color:#7da3ff; margin-bottom:16px;
        }
        .ab-page-title { font-size:clamp(2rem,4vw,3rem); font-weight:800; color:#fff; letter-spacing:-.8px; margin-bottom:14px; }
        .ab-page-desc  { font-size:1.05rem; color:#8888a8; max-width:560px; line-height:1.75; }
        .ab-section { padding:80px 0; background:#f9fafb; }
        .ab-card {
          background:#fff; border:1px solid rgba(0,0,0,.06);
          border-radius:20px; padding:36px 32px;
          box-shadow:0 4px 24px rgba(0,0,0,.04);
          transition:all .4s cubic-bezier(.16,1,.3,1);
          height:100%;
        }
        .ab-card:hover { transform:translateY(-6px); box-shadow:0 20px 48px rgba(67,97,238,.08); border-color:rgba(67,97,238,.14); }
        .ab-card-icon { width:56px; height:56px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin-bottom:18px; }
        .ab-card-title { font-size:1.1rem; font-weight:700; color:#1a1a2e; margin-bottom:8px; }
        .ab-card-desc  { font-size:.88rem; color:#6b7280; line-height:1.65; margin:0; }
        .ab-mission {
          background:linear-gradient(135deg,#06061a,#0d0d22);
          padding:80px 0; position:relative; overflow:hidden;
        }
        .ab-mission::before {
          content:''; position:absolute; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(247,37,133,.12),transparent 65%);
          bottom:-20%; left:-10%; filter:blur(60px); pointer-events:none;
        }
        .ab-mission-title { font-size:clamp(1.8rem,3.5vw,2.4rem); font-weight:800; color:#fff; letter-spacing:-.5px; margin-bottom:14px; }
        .ab-mission-text  { font-size:1rem; color:#8888a8; line-height:1.8; margin-bottom:0; }
        .ab-stat-pill {
          display:inline-flex; flex-direction:column; align-items:center;
          padding:20px 28px; border-radius:18px; width:100%;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
        }
        .ab-stat-pill-val {
          font-size:2rem; font-weight:800; letter-spacing:-1px;
          background:linear-gradient(135deg,#4361ee,#7c3aed);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .ab-stat-pill-lbl { font-size:.72rem; font-weight:600; color:rgba(255,255,255,.35); text-transform:uppercase; letter-spacing:.9px; }
        .ab-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .ab-cards-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        @media(max-width:768px){
          .ab-cards-grid { grid-template-columns:1fr 1fr; }
          .ab-stats-grid { grid-template-columns:1fr 1fr; }
        }
        @media(max-width:480px){ .ab-cards-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* Hero */}
      <div className="ab-hero">
        <div className="container" style={{position:'relative',zIndex:2}}>
          <span className="ab-page-tag">About Us</span>
          <h1 className="ab-page-title">Built to Unlock<br />Every Child's Potential</h1>
          <p className="ab-page-desc">We combine machine learning with child development insights to help parents guide their children toward hobbies that truly fit them.</p>
        </div>
      </div>

      {/* Mission + Stats */}
      <section className="ab-mission">
        <div className="container" style={{position:'relative',zIndex:2}}>
          <div style={{display:'flex',gap:'60px',alignItems:'center',flexWrap:'wrap'}}>
            <div style={{flex:'1',minWidth:'300px'}}>
              <div style={{width:'36px',height:'3px',borderRadius:'2px',background:'#4361ee',marginBottom:'18px'}} />
              <h2 className="ab-mission-title">Our Mission</h2>
              <p className="ab-mission-text">
                Every child is unique. Our mission is to empower parents with intelligent tools that reveal their child's natural strengths — so they can nurture the right hobby at the right age. By combining real-world data with state-of-the-art machine learning, we give every family a data-driven head start.
              </p>
            </div>
            <div style={{flex:'1',minWidth:'280px'}}>
              <div className="ab-stats-grid">
                {STATS.map(s => (
                  <div className="ab-stat-pill" key={s.lbl}>
                    <span className="ab-stat-pill-val">{s.val}</span>
                    <span className="ab-stat-pill-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="ab-section">
        <div className="container">
          <div style={{textAlign:'center',marginBottom:'3rem'}}>
            <div style={{width:'36px',height:'3px',borderRadius:'2px',background:'#4361ee',margin:'0 auto 16px'}} />
            <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.4rem)',fontWeight:800,color:'#1a1a2e',letterSpacing:'-.5px',marginBottom:'10px'}}>What We Offer</h2>
            <p style={{color:'#6b7280',fontSize:'.95rem',maxWidth:'480px',margin:'0 auto'}}>A full-stack, ML-powered platform designed around accuracy, privacy, and simplicity.</p>
          </div>
          <div className="ab-cards-grid">
            {CARDS.map(c => (
              <div className="ab-card" key={c.title}>
                <div className="ab-card-icon" style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`}}>
                  <i className={`bi ${c.icon}`} />
                </div>
                <h4 className="ab-card-title">{c.title}</h4>
                <p className="ab-card-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
