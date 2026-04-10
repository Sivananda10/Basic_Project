import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="sb-footer">
      <div className="container" style={{maxWidth:'1100px',margin:'0 auto',padding:'0 1.5rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'2rem'}}>

          {/* Brand */}
          <div>
            <div className="sb-footer-logo">
              <div className="sb-footer-logo-icon"><i className="bi bi-stars" /></div>
              <span className="sb-footer-logo-name">HobbyPredictor</span>
            </div>
            <p className="sb-footer-tagline">Helping parents discover the perfect hobby for their children using the power of machine learning.</p>
          </div>

          {/* Pages */}
          <div>
            <div className="sb-footer-heading">Pages</div>
            <Link to="/"        className="sb-footer-link">Home</Link>
            <Link to="/about"   className="sb-footer-link">About</Link>
            <Link to="/contact" className="sb-footer-link">Contact</Link>
            {user && <>
              <Link to="/predict" className="sb-footer-link">Predict</Link>
              <Link to="/history" className="sb-footer-link">History</Link>
            </>}
          </div>

          {/* Categories */}
          <div>
            <div className="sb-footer-heading">Categories</div>
            {['Sports','Arts','Academics','Analytical','Health & Fitness'].map(c=>(
              <Link key={c} to="/" className="sb-footer-link">{c}</Link>
            ))}
          </div>

          {/* Platform stats */}
          <div>
            <div className="sb-footer-heading">Platform</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div className="sb-footer-stat"><div className="sb-footer-stat-val" style={{color:'#7da3ff'}}>92.5%</div><div className="sb-footer-stat-lbl">Accuracy</div></div>
              <div className="sb-footer-stat"><div className="sb-footer-stat-val" style={{color:'#5ef0c0'}}>2500+</div><div className="sb-footer-stat-lbl">Records</div></div>
              <div className="sb-footer-stat"><div className="sb-footer-stat-val" style={{color:'#ffa77d'}}>19</div><div className="sb-footer-stat-lbl">Parameters</div></div>
              <div className="sb-footer-stat"><div className="sb-footer-stat-val" style={{color:'#d49fff'}}>5</div><div className="sb-footer-stat-lbl">Categories</div></div>
            </div>
          </div>
        </div>

        <div className="sb-footer-bottom">
          <span className="sb-footer-copy">© 2026 HobbyPredictor. Built for educational purposes.</span>
          <div className="sb-footer-badges">
            <span className="sb-footer-badge"><i className="bi bi-cpu" /> Random Forest</span>
            <span className="sb-footer-badge"><i className="bi bi-shield-check" /> Privacy Safe</span>
            <span className="sb-footer-badge"><i className="bi bi-gift" /> Free to Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
