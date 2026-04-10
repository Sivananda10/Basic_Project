import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]     = useState({ first_name:'', last_name:'', username:'', email:'', password:'', password2:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const data = err.response?.data || {};
      setErrors(typeof data === 'object' ? data : { non_field_errors: [JSON.stringify(data)] });
    } finally {
      setLoading(false);
    }
  };

  const fieldErr = (key) => errors[key]
    ? <div className="form-error">{Array.isArray(errors[key]) ? errors[key][0] : errors[key]}</div>
    : null;

  return (
    <div className="auth-page-bg">
      <div className="container py-5">
        <div className="auth-row">
          {/* Illustration */}
          <div className="auth-illus">
            <div className="auth-illus-img-wrap">
              <img
                src="/login_illustration.png"
                alt="Kids Hobby AI Illustration"
                className="auth-illus-img"
              />
            </div>
          </div>

          {/* Form */}
          <div className="auth-form-col" style={{maxWidth:'520px'}}>
            <div className="auth-card shadow-lg">
              <div className="auth-card-body">
                <div className="auth-head">
                  <div className="auth-icon-wrapper">
                    <i className="bi bi-person-plus" style={{fontSize:'2rem',color:'#4361ee'}} />
                  </div>
                  <h3>Create Account</h3>
                  <p style={{color:'#636e72'}}>Fill in the details below to register</p>
                </div>

                {errors.non_field_errors && (
                  <div className="alert-box alert-danger"><i className="bi bi-exclamation-circle" /> {errors.non_field_errors[0]}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-row-2">
                    <div className="form-group-auth">
                      <label className="form-label-auth">First Name</label>
                      <input name="first_name" type="text" className="form-ctrl" placeholder="First name" value={form.first_name} onChange={handleChange} required />
                      {fieldErr('first_name')}
                    </div>
                    <div className="form-group-auth">
                      <label className="form-label-auth">Last Name</label>
                      <input name="last_name" type="text" className="form-ctrl" placeholder="Last name" value={form.last_name} onChange={handleChange} required />
                      {fieldErr('last_name')}
                    </div>
                  </div>

                  <div className="form-group-auth">
                    <label className="form-label-auth"><i className="bi bi-person text-primary" /> Username</label>
                    <input name="username" type="text" className="form-ctrl" placeholder="Choose a username" value={form.username} onChange={handleChange} required />
                    {fieldErr('username')}
                  </div>

                  <div className="form-group-auth">
                    <label className="form-label-auth"><i className="bi bi-envelope text-primary" /> Email</label>
                    <input name="email" type="email" className="form-ctrl" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                    {fieldErr('email')}
                  </div>

                  <div className="form-row-2">
                    <div className="form-group-auth">
                      <label className="form-label-auth"><i className="bi bi-lock text-primary" /> Password</label>
                      <input name="password" type="password" className="form-ctrl" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
                      {fieldErr('password')}
                    </div>
                    <div className="form-group-auth">
                      <label className="form-label-auth">Confirm Password</label>
                      <input name="password2" type="password" className="form-ctrl" placeholder="Repeat password" value={form.password2} onChange={handleChange} required />
                      {fieldErr('password2')}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary-full" style={{marginTop:'.5rem'}} disabled={loading}>
                    {loading ? <><span className="spinner-sm"/> Creating…</> : <><i className="bi bi-person-check"/> Register</>}
                  </button>
                </form>

                <div style={{textAlign:'center',marginTop:'1.5rem'}}>
                  <p style={{color:'#636e72',marginBottom:0}}>
                    Already have an account? <Link to="/login" style={{color:'#4361ee',fontWeight:600,textDecoration:'none'}}>Sign in here</Link>
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
