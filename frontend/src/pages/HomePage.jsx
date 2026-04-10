import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const heroRef = useRef(null);

  // Scroll-reveal animations
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const sibs = e.target.parentElement.querySelectorAll('.hp-reveal');
          const idx  = Array.from(sibs).indexOf(e.target);
          e.target.style.transitionDelay = idx * 0.11 + 's';
          e.target.classList.add('hp-revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' });
    document.querySelectorAll('.hp-reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Animated counters
  useEffect(() => {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el  = e.target;
        const tgt = parseFloat(el.dataset.target);
        const pct = el.classList.contains('hp-pct');
        const dur = 2000;
        const t0  = performance.now();
        const run = now => {
          const p  = Math.min((now - t0) / dur, 1);
          const ep = 1 - Math.pow(1 - p, 4);
          const v  = ep * tgt;
          el.textContent = pct ? v.toFixed(1) + '%' : Math.floor(v).toLocaleString() + (tgt >= 100 ? '+' : '');
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.hp-stat-val[data-target]').forEach(el => co.observe(el));
    return () => co.disconnect();
  }, []);

  // Hero orb parallax
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handler = ev => {
      const r = hero.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width  - 0.5;
      const y = (ev.clientY - r.top)  / r.height - 0.5;
      hero.querySelectorAll('.hp-orb').forEach((o, i) => {
        const s = (i + 1) * 18;
        o.style.transform = `translate(${x * s}px,${y * s}px)`;
      });
    };
    hero.addEventListener('mousemove', handler);
    return () => hero.removeEventListener('mousemove', handler);
  }, []);

  const CARDS = [
    { accent: '#4361ee', accentGrad: 'linear-gradient(90deg,#4361ee,#7c3aed)', label: 'Category 01', title: 'Sports',
      img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80&fit=crop',
      desc: 'Active, competitive and passionate about physical challenges',
      tags: ['Cricket', 'Football', 'Athletics'] },
    { accent: '#f72585', accentGrad: 'linear-gradient(90deg,#f72585,#ff6b9d)', label: 'Category 02', title: 'Arts',
      img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80&fit=crop',
      desc: 'Creative interests in drawing, painting, music and crafts',
      tags: ['Drawing', 'Music', 'Crafts'] },
    { accent: '#06d6a0', accentGrad: 'linear-gradient(90deg,#06d6a0,#05a37d)', label: 'Category 03', title: 'Academics',
      img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80&fit=crop',
      desc: 'Strong inclination toward learning, research and science',
      tags: ['Science', 'Maths', 'Research'] },
    { accent: '#ffd166', accentGrad: 'linear-gradient(90deg,#ffd166,#f4a300)', label: 'Category 04', title: 'Analytical Thinking',
      img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80&fit=crop',
      desc: 'Loves solving puzzles, strategy games and logical challenges',
      tags: ['Chess', 'Coding', 'Robotics'] },
    { accent: '#4cc9f0', accentGrad: 'linear-gradient(90deg,#4cc9f0,#0096c7)', label: 'Category 05', title: 'Health & Fitness',
      img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80&fit=crop',
      desc: 'Highly active, health-conscious and values physical wellness',
      tags: ['Yoga', 'Martial Arts', 'Gymnastics'] },
  ];

  const ImgCard = ({ c }) => (
    <div className="hp-img-card" style={{ '--card-accent': c.accent }}>
      <img src={c.img} alt={c.title} loading="lazy" />
      <div className="hp-img-card__overlay" />
      <div className="hp-img-card__accent" style={{ background: c.accentGrad }} />
      <div className="hp-img-card__body">
        <div className="hp-img-card__label">{c.label}</div>
        <div className="hp-img-card__title">{c.title}</div>
        <div className="hp-img-card__desc">{c.desc}</div>
        <div className="hp-img-card__tags">{c.tags.map(t => <span key={t}>{t}</span>)}</div>
      </div>
    </div>
  );

  return (
    <div className="hp-main">

      {/* ════════════════ HERO ════════════════ */}
      <section className="hp-hero" id="hero" ref={heroRef}>
        <div className="hp-hero-grid" />
        <div className="hp-orb hp-orb-1" />
        <div className="hp-orb hp-orb-2" />
        <div className="hp-orb hp-orb-3" />

        <div className="container">
          <div className="hp-hero-inner">

            <h1 className="hp-h1">
              Discover Your Child's<br />
              <span className="hp-grad">Perfect Hobby</span>
            </h1>

            <p className="hp-sub">
              Our <strong>Random Forest AI</strong> analyzes your child's interests,
              skills &amp; activities to predict the ideal hobby for ages 5–17 —
              with <strong>92.5% accuracy</strong>.
            </p>

            <div className="hp-btns">
              {user ? (
                <>
                  <Link to="/predict" className="hp-btn hp-btn-primary" id="hero-predict-btn">
                    <i className="bi bi-magic" /> Predict Hobby Now
                  </Link>
                  <Link to="/history" className="hp-btn hp-btn-ghost" id="hero-history-btn">
                    <i className="bi bi-clock-history" /> View History
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="hp-btn hp-btn-primary" id="hero-register-btn">
                    <i className="bi bi-rocket-takeoff" /> Get Started Free
                  </Link>
                  <Link to="/login" className="hp-btn hp-btn-ghost" id="hero-login-btn">
                    <i className="bi bi-box-arrow-in-right" /> Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="hp-trust">
              <div className="hp-trust-item"><i className="bi bi-shield-check" /> 92.5% Accuracy</div>
              <div className="hp-trust-sep" />
              <div className="hp-trust-item"><i className="bi bi-database" /> 2,500+ Records</div>
              <div className="hp-trust-sep" />
              <div className="hp-trust-item"><i className="bi bi-grid-3x3-gap" /> 5 Categories</div>
              <div className="hp-trust-sep" />
              <div className="hp-trust-item"><i className="bi bi-gift" /> Free to Use</div>
            </div>
          </div>
        </div>
        <div className="hp-hero-fade" />
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="hp-hiw" id="how-it-works">
        <div className="hp-hiw-shape hp-hiw-shape-1" />
        <div className="hp-hiw-shape hp-hiw-shape-2" />
        <div className="container">
          <div className="text-center mb-5 hp-reveal">
            <div style={{ width: '38px', height: '4px', borderRadius: '2px', background: '#4361ee', margin: '0 auto 18px' }} />
            <h2 className="hp-section-title" style={{ color: '#1a1a2e' }}>How It Works</h2>
            <p className="hp-section-desc">Predict your child's ideal hobby in three simple steps — powered by real data and machine learning.</p>
          </div>

          <div className="hp-steps" id="hp-steps-row">
            {/* Dashed arc (desktop only) */}
            <svg className="hp-steps-svg" viewBox="0 0 960 130" fill="none" preserveAspectRatio="none">
              <path d="M115 105 C 260 105, 200 22, 480 22 S 700 105, 845 105"
                    stroke="url(#hiwG)" strokeWidth="2" strokeDasharray="9 7"
                    fill="none" strokeLinecap="round"/>
              <defs>
                <linearGradient id="hiwG" x1="0" y1="60" x2="960" y2="60">
                  <stop offset="0%"   stopColor="#4361ee" stopOpacity=".55"/>
                  <stop offset="50%"  stopColor="#7c3aed" stopOpacity=".4"/>
                  <stop offset="100%" stopColor="#06d6a0" stopOpacity=".55"/>
                </linearGradient>
              </defs>
            </svg>

            {/* Step 1 */}
            <div className="hp-step hp-reveal">
              <div className="hp-step-card">
                <div className="hp-step-num">01</div>
                <div className="hp-step-icon hp-icon-blue"><i className="bi bi-pencil-square" /></div>
                <div className="hp-mini-window">
                  <div className="hp-mini-tbar"><span/><span/><span/></div>
                  <div className="hp-mini-body">
                    <div className="hp-line hp-line-sm"/><div className="hp-line"/><div className="hp-line hp-line-md"/>
                    <div className="hp-mini-field"/><div className="hp-mini-field"/><div className="hp-mini-btn"/>
                  </div>
                </div>
              </div>
              <h4 className="hp-step-label">Enter Child's Data</h4>
              <p className="hp-step-desc">Parents answer 19 quick questions about their child's age, interests, activities, logic skills &amp; health habits.</p>
            </div>

            {/* Arrow */}
            <div className="hp-arrow hp-reveal">
              <svg viewBox="0 0 60 24" fill="none"><path d="M0 12h46m0 0l-8-7m8 7l-8 7" stroke="url(#arr1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="arr1" x1="0" y1="12" x2="46" y2="12"><stop stopColor="#4361ee"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs></svg>
            </div>

            {/* Step 2 */}
            <div className="hp-step hp-reveal">
              <div className="hp-step-card">
                <div className="hp-step-num">02</div>
                <div className="hp-step-icon hp-icon-purple"><i className="bi bi-cpu" /></div>
                <div className="hp-mini-window">
                  <div className="hp-mini-tbar"><span/><span/><span/></div>
                  <div className="hp-mini-body">
                    <div className="hp-mini-chart">
                      <div className="hp-mini-bar" style={{height:'38%',background:'#4361ee'}}/>
                      <div className="hp-mini-bar" style={{height:'68%',background:'#06d6a0'}}/>
                      <div className="hp-mini-bar" style={{height:'52%',background:'#7c3aed'}}/>
                      <div className="hp-mini-bar" style={{height:'84%',background:'#4361ee'}}/>
                      <div className="hp-mini-bar" style={{height:'44%',background:'#f72585'}}/>
                    </div>
                    <div className="hp-line hp-line-sm" style={{marginTop:'7px'}}/>
                  </div>
                </div>
                <div className="hp-step-badge"><i className="bi bi-stars" /></div>
              </div>
              <h4 className="hp-step-label">AI Analysis</h4>
              <p className="hp-step-desc">Our Random Forest model compares patterns across 2,500+ training records across 5 ML algorithms.</p>
            </div>

            {/* Arrow */}
            <div className="hp-arrow hp-reveal">
              <svg viewBox="0 0 60 24" fill="none"><path d="M0 12h46m0 0l-8-7m8 7l-8 7" stroke="url(#arr2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="arr2" x1="0" y1="12" x2="46" y2="12"><stop stopColor="#7c3aed"/><stop offset="1" stopColor="#06d6a0"/></linearGradient></defs></svg>
            </div>

            {/* Step 3 */}
            <div className="hp-step hp-reveal">
              <div className="hp-step-card">
                <div className="hp-step-num">03</div>
                <div className="hp-step-icon hp-icon-teal"><i className="bi bi-trophy" /></div>
                <div className="hp-mini-window">
                  <div className="hp-mini-tbar"><span/><span/><span/></div>
                  <div className="hp-mini-body" style={{alignItems:'center'}}>
                    <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'linear-gradient(135deg,#4361ee,#4cc9f0)',margin:'0 auto 7px'}}/>
                    <div className="hp-line hp-line-sm" style={{margin:'0 auto 4px'}}/><div className="hp-line hp-line-xs" style={{margin:'0 auto 8px'}}/>
                    <div className="hp-mini-prog-wrap" style={{width:'85%'}}><div className="hp-mini-prog"/></div>
                  </div>
                </div>
                <div className="hp-step-check"><i className="bi bi-check-lg" /></div>
              </div>
              <h4 className="hp-step-label">Get Prediction</h4>
              <p className="hp-step-desc">Instantly receive your child's predicted hobby category with a confidence score and activity breakdown.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CATEGORIES (image marquee) ════════════════ */}
      <section className="hp-cats" id="categories">
        <div className="container">
          <div className="text-center mb-5 hp-reveal">
            <span className="hp-tag" style={{borderColor:'rgba(76,201,240,.25)',background:'rgba(76,201,240,.08)',color:'#4cc9f0'}}>5 Categories</span>
            <h2 className="hp-section-title" style={{color:'#fff'}}>Hobby Categories</h2>
            <p className="hp-section-desc" style={{color:'#8888a8'}}>Our AI predicts your child's ideal domain across five expertly curated hobby areas.</p>
          </div>
        </div>

        {/* Full-width marquee */}
        <div className="hp-marquee-wrap">
          <div className="hp-marquee-track">
            {CARDS.map(c => <ImgCard key={c.title + '1'} c={c} />)}
            {CARDS.map(c => <ImgCard key={c.title + '2'} c={c} />)}
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="hp-stats-sec" id="stats">
        <div className="container">
          <div className="text-center mb-5 hp-reveal">
            <span className="hp-tag">Platform Stats</span>
            <h2 className="hp-section-title" style={{color:'#1a1a2e'}}>Built on Real Data</h2>
            <p className="hp-section-desc">Rigorous machine learning backed by thousands of real-world data points.</p>
          </div>
          <div className="hp-stats-grid">
            <div className="hp-stat hp-reveal">
              <div className="hp-stat-ico"><i className="bi bi-database-fill" /></div>
              <div className="hp-stat-val" data-target="2500">0</div>
              <div className="hp-stat-lbl">Training Records</div>
            </div>
            <div className="hp-stat hp-reveal">
              <div className="hp-stat-ico"><i className="bi bi-sliders" /></div>
              <div className="hp-stat-val" data-target="19">0</div>
              <div className="hp-stat-lbl">Input Parameters</div>
            </div>
            <div className="hp-stat hp-reveal">
              <div className="hp-stat-ico"><i className="bi bi-gear-wide-connected" /></div>
              <div className="hp-stat-val" data-target="5">0</div>
              <div className="hp-stat-lbl">ML Algorithms</div>
            </div>
            <div className="hp-stat hp-reveal">
              <div className="hp-stat-ico"><i className="bi bi-bullseye" /></div>
              <div className="hp-stat-val hp-pct" data-target="92.5">0</div>
              <div className="hp-stat-lbl">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="hp-cta" id="cta">
        <div className="container">
          <div className="hp-cta-inner hp-reveal">
            <h2 className="hp-cta-title">Ready to Discover Your Child's Hobby?</h2>
            <p className="hp-cta-desc">It takes less than 2 minutes — free, instant, and powered by AI.</p>
            {user ? (
              <Link to="/predict" className="hp-btn-cta" id="cta-predict-btn">
                <i className="bi bi-magic" /> Start Prediction
              </Link>
            ) : (
              <Link to="/register" className="hp-btn-cta" id="cta-register-btn">
                <i className="bi bi-rocket-takeoff" /> Get Started for Free
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
