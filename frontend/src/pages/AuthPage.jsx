import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './AuthPage.css';

export default function AuthPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useToast();

  // Determine initial mode from URL
  const [mode, setMode]       = useState(location.pathname === '/register' ? 'register' : 'login');
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir]   = useState(''); // 'up' | 'down'

  // Keep URL in sync with mode
  useEffect(() => {
    navigate(mode === 'login' ? '/login' : '/register', { replace: true });
  }, [mode]); // eslint-disable-line

  // Switch mode with animation
  const switchMode = (next) => {
    if (next === mode || animating) return;
    setSlideDir(next === 'register' ? 'up' : 'down');
    setAnimating(true);
    setTimeout(() => {
      setMode(next);
      setAnimating(false);
    }, 340);
  };

  // ── Login state ──────────────────────────────
  const [loginForm, setLoginForm]     = useState({ username: '', password: '' });
  const [loginError, setLoginError]   = useState('');
  const [loginLoad, setLoginLoad]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoad(true);
    try {
      const u = await login(loginForm);
      addToast(`Welcome back, ${u.first_name || u.username}! 👋`, 'success');
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally { setLoginLoad(false); }
  };

  // ── Register state ───────────────────────────
  const [regForm, setRegForm]     = useState({ first_name:'', last_name:'', username:'', email:'', password:'', password2:'' });
  const [regErrors, setRegErrors] = useState({});
  const [regLoad, setRegLoad]     = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegErrors({});
    setRegLoad(true);
    try {
      const u = await register(regForm);
      addToast(`Account created successfully! Welcome, ${u.first_name || u.username} 🎉`, 'success');
      navigate('/');
    } catch (err) {
      const data = err.response?.data || {};
      setRegErrors(typeof data === 'object' ? data : { non_field_errors: [JSON.stringify(data)] });
    } finally { setRegLoad(false); }
  };

  const fieldErr = (key) => regErrors[key]
    ? <div className="ap-field-err">{Array.isArray(regErrors[key]) ? regErrors[key][0] : regErrors[key]}</div>
    : null;

  return (
    <div className="ap-page">
      <div className="ap-card">

        {/* ── LEFT: Illustration ── */}
        <div className="ap-left">
          <div className="ap-illus-wrap">
            <img src="/login_illustration.png" alt="HobbyPredictor AI" className="ap-illus-img" />
          </div>
          {/* Decorative blobs */}
          <div className="ap-blob ap-blob-1" />
          <div className="ap-blob ap-blob-2" />
        </div>

        {/* ── RIGHT: Form panel ── */}
        <div className="ap-right">
          <div className={`ap-form-panel${animating ? ` ap-exit-${slideDir}` : ''}`}>

            {mode === 'login' ? (
              /* ── LOGIN FORM ── */
              <div className="ap-form-inner">
                <div className="ap-form-head">
                  <div className="ap-head-icon" style={{ background: 'linear-gradient(135deg,rgba(67,97,238,.12),rgba(67,97,238,.06))', color: '#4361ee' }}>
                    <i className="bi bi-box-arrow-in-right" />
                  </div>
                  <h2 className="ap-form-title">Welcome Back</h2>
                  <p className="ap-form-sub">Login to predict your child's hobby</p>
                </div>

                {loginError && (
                  <div className="ap-alert ap-alert-err">
                    <i className="bi bi-exclamation-circle" /> {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="ap-field">
                    <label className="ap-label" htmlFor="ap-username">
                      <i className="bi bi-person" /> Username
                    </label>
                    <input id="ap-username" className="ap-input" type="text" placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required autoFocus />
                  </div>
                  <div className="ap-field">
                    <label className="ap-label" htmlFor="ap-password">
                      <i className="bi bi-lock" /> Password
                    </label>
                    <input id="ap-password" className="ap-input" type="password" placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
                  </div>
                  <button type="submit" className="ap-btn" disabled={loginLoad}>
                    {loginLoad ? <><span className="ap-spinner" /> Signing in…</> : <><i className="bi bi-box-arrow-in-right" /> Login</>}
                  </button>
                </form>

                <p className="ap-switch-text">
                  Don't have an account?{' '}
                  <button className="ap-switch-btn" onClick={() => switchMode('register')}>
                    Register here
                  </button>
                </p>
              </div>

            ) : (
              /* ── REGISTER FORM ── */
              <div className="ap-form-inner">
                <div className="ap-form-head">
                  <div className="ap-head-icon" style={{ background: 'linear-gradient(135deg,rgba(247,37,133,.1),rgba(247,37,133,.05))', color: '#f72585' }}>
                    <i className="bi bi-person-plus" />
                  </div>
                  <h2 className="ap-form-title">Create Account</h2>
                  <p className="ap-form-sub">Fill in the details below to register</p>
                </div>

                {regErrors.non_field_errors && (
                  <div className="ap-alert ap-alert-err">
                    <i className="bi bi-exclamation-circle" /> {regErrors.non_field_errors[0]}
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="ap-row-2">
                    <div className="ap-field">
                      <label className="ap-label">First Name</label>
                      <input className="ap-input" type="text" placeholder="First name"
                        value={regForm.first_name} onChange={e => setRegForm({...regForm, first_name:e.target.value})} required />
                      {fieldErr('first_name')}
                    </div>
                    <div className="ap-field">
                      <label className="ap-label">Last Name</label>
                      <input className="ap-input" type="text" placeholder="Last name"
                        value={regForm.last_name} onChange={e => setRegForm({...regForm, last_name:e.target.value})} required />
                      {fieldErr('last_name')}
                    </div>
                  </div>
                  <div className="ap-field">
                    <label className="ap-label"><i className="bi bi-person" /> Username</label>
                    <input className="ap-input" type="text" placeholder="Choose a username"
                      value={regForm.username} onChange={e => setRegForm({...regForm, username:e.target.value})} required />
                    {fieldErr('username')}
                  </div>
                  <div className="ap-field">
                    <label className="ap-label"><i className="bi bi-envelope" /> Email</label>
                    <input className="ap-input" type="email" placeholder="your@email.com"
                      value={regForm.email} onChange={e => setRegForm({...regForm, email:e.target.value})} required />
                    {fieldErr('email')}
                  </div>
                  <div className="ap-row-2">
                    <div className="ap-field">
                      <label className="ap-label"><i className="bi bi-lock" /> Password</label>
                      <input className="ap-input" type="password" placeholder="Min. 8 characters"
                        value={regForm.password} onChange={e => setRegForm({...regForm, password:e.target.value})} required minLength={8} />
                      {fieldErr('password')}
                    </div>
                    <div className="ap-field">
                      <label className="ap-label">Confirm Password</label>
                      <input className="ap-input" type="password" placeholder="Repeat password"
                        value={regForm.password2} onChange={e => setRegForm({...regForm, password2:e.target.value})} required />
                      {fieldErr('password2')}
                    </div>
                  </div>
                  <button type="submit" className="ap-btn ap-btn-pink" disabled={regLoad}>
                    {regLoad ? <><span className="ap-spinner" /> Creating…</> : <><i className="bi bi-person-check" /> Register</>}
                  </button>
                </form>

                <p className="ap-switch-text">
                  Already have an account?{' '}
                  <button className="ap-switch-btn" onClick={() => switchMode('login')}>
                    Sign in here
                  </button>
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
