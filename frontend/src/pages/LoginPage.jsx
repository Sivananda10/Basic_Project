import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="container py-5">
        <div className="auth-row">
          {/* Illustration Side */}
          <div className="auth-illus">
            <div className="auth-illus-img-wrap">
              <img
                src="/login_illustration.png"
                alt="Kids Hobby AI Illustration"
                className="auth-illus-img"
              />
            </div>
          </div>

          {/* Form Side */}
          <div className="auth-form-col">
            <div className="auth-card shadow-lg">
              <div className="auth-card-body">
                <div className="auth-head">
                  <div className="auth-icon-wrapper">
                    <i className="bi bi-box-arrow-in-right" style={{ fontSize: '2rem', color: '#4361ee' }} />
                  </div>
                  <h3>Welcome Back</h3>
                  <p>Login to predict your child's hobby</p>
                </div>

                {error && (
                  <div className="alert-box alert-danger">
                    <i className="bi bi-exclamation-circle" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group-auth">
                    <label htmlFor="username" className="form-label-auth">
                      <i className="bi bi-person text-primary" /> Username
                    </label>
                    <input id="username" name="username" type="text" className="form-ctrl"
                      placeholder="Enter your username" value={form.username}
                      onChange={handleChange} required autoFocus />
                  </div>

                  <div className="form-group-auth" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="password" className="form-label-auth">
                      <i className="bi bi-lock text-primary" /> Password
                    </label>
                    <input id="password" name="password" type="password" className="form-ctrl"
                      placeholder="Enter your password" value={form.password}
                      onChange={handleChange} required />
                  </div>

                  <button type="submit" className="btn-primary-full" disabled={loading}>
                    {loading
                      ? <><span className="spinner-sm" /> Signing in…</>
                      : <><i className="bi bi-box-arrow-in-right" /> Login</>}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <p style={{ color: '#636e72', marginBottom: 0 }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#4361ee', fontWeight: 600, textDecoration: 'none' }}>
                      Register here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
