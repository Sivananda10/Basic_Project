import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../api/authApi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ first_name:'', last_name:'', email:'' });
  const [pwForm,  setPwForm]  = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [msg,     setMsg]     = useState({ type:'', text:'' });
  const [loading, setLoading] = useState(false);
  const [stats,   setStats]   = useState({ total_predictions:0, recent_predictions:[] });

  useEffect(() => {
    getProfile().then(({ data }) => {
      setProfile({ first_name: data.user.first_name, last_name: data.user.last_name, email: data.user.email });
      setStats({ total_predictions: data.total_predictions, recent_predictions: data.recent_predictions });
    });
  }, []);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type:'', text:'' }), 4000); };

  const handleProfileSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateProfile(profile); await refreshUser(); showMsg('success','Profile updated!'); }
    catch (err) { showMsg('error', err.response?.data?.email?.[0] || 'Update failed.'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setLoading(true);
    try { const { data } = await changePassword(pwForm); showMsg('success', data.message); setPwForm({ current_password:'', new_password:'', confirm_password:'' }); }
    catch (err) { const d = err.response?.data || {}; showMsg('error', d.error || Object.values(d)[0]?.[0] || 'Password change failed.'); }
    finally { setLoading(false); }
  };

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase();
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username;

  return (
    <>
      {/* Dark hero banner — exact profile.html style */}
      <div className="pf-hero">
        <div className="pf-container pf-hero-inner">
          <div className="pf-hero-row">
            <div className="pf-avatar">{initial}</div>
            <div>
              <div className="pf-hero-name">{fullName}</div>
              <div className="pf-hero-user">@{user?.username}</div>
              <div className="pf-pills">
                {user?.is_staff && <span className="pf-hero-pill" style={{borderColor:'rgba(255,209,102,.25)',background:'rgba(255,209,102,.1)',color:'#f4a300'}}><i className="bi bi-shield-check"/>Admin</span>}
                <span className="pf-hero-pill"><i className="bi bi-magic"/> {stats.total_predictions} Predictions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pf-page">
        <div className="pf-container">

          {msg.text && (
            <div className={`alert-box-pf ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{marginBottom:'1.5rem'}}>
              <i className={`bi ${msg.type==='success'?'bi-check-circle':'bi-exclamation-circle'}`}/> {msg.text}
            </div>
          )}

          {/* Stat row */}
          <div className="pf-stat-row">
            {[
              {val: stats.total_predictions, lbl:'Predictions'},
              {val: user?.date_joined ? new Date(user.date_joined).getFullYear() : '—', lbl:'Member Since'},
              {val: user?.is_staff ? 'Admin' : 'User', lbl:'Account Type', small:true},
              {val: 'Active', lbl:'Status', small:true, teal:true},
            ].map((s,i)=>{
              const valStyle = {
                ...(s.small ? {fontSize:'1.5rem'} : {}),
                ...(s.teal  ? {background:'linear-gradient(135deg,#06d6a0,#4cc9f0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'} : {}),
              };
              return (
                <div key={i} className="pf-stat-card">
                  <div className="pf-stat-val" style={valStyle}>{s.val}</div>
                  <div className="pf-stat-lbl">{s.lbl}</div>
                </div>
              );
            })}
          </div>

          <div className="pf-main-row">
            {/* LEFT — forms */}
            <div className="pf-left">

              {/* Edit Profile */}
              <div className="pf-section">
                <div className="pf-section-title"><i className="bi bi-person-gear"/>Edit Profile</div>
                <form onSubmit={handleProfileSave}>
                  <div className="pf-row-2">
                    <div className="pf-field">
                      <label className="pf-label">First Name</label>
                      <input className="pf-input" type="text" value={profile.first_name} onChange={e=>setProfile({...profile,first_name:e.target.value})} placeholder="Your first name" />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">Last Name</label>
                      <input className="pf-input" type="text" value={profile.last_name} onChange={e=>setProfile({...profile,last_name:e.target.value})} placeholder="Your last name" />
                    </div>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Email Address</label>
                    <input className="pf-input" type="email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})} placeholder="your@email.com" />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Username</label>
                    <input className="pf-input" type="text" value={user?.username || ''} readOnly />
                    <small style={{fontSize:'.72rem',color:'#9ca3af',marginTop:'4px',display:'block'}}>Username cannot be changed.</small>
                  </div>
                  <button type="submit" className="pf-btn-save" disabled={loading}><i className="bi bi-check-lg"/> Save Changes</button>
                </form>
              </div>

              {/* Change Password */}
              <div className="pf-section">
                <div className="pf-section-title"><i className="bi bi-lock"/>Change Password</div>
                <form onSubmit={handlePasswordChange}>
                  <div className="pf-field">
                    <label className="pf-label">Current Password</label>
                    <input className="pf-input" type="password" value={pwForm.current_password} onChange={e=>setPwForm({...pwForm,current_password:e.target.value})} placeholder="••••••••" required />
                  </div>
                  <div className="pf-row-2">
                    <div className="pf-field">
                      <label className="pf-label">New Password</label>
                      <input className="pf-input" type="password" value={pwForm.new_password} onChange={e=>setPwForm({...pwForm,new_password:e.target.value})} placeholder="Min. 8 characters" required />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">Confirm New Password</label>
                      <input className="pf-input" type="password" value={pwForm.confirm_password} onChange={e=>setPwForm({...pwForm,confirm_password:e.target.value})} placeholder="Repeat password" required />
                    </div>
                  </div>
                  <button type="submit" className="pf-btn-danger" disabled={loading}><i className="bi bi-key"/> Change Password</button>
                </form>
              </div>
            </div>

            {/* RIGHT — account info + recent */}
            <div className="pf-right">
              {/* Account Info */}
              <div className="pf-section">
                <div className="pf-section-title"><i className="bi bi-info-circle"/>Account Info</div>
                {[
                  {k:'Username',    v:user?.username},
                  {k:'Email',       v:user?.email || '—'},
                  {k:'Full Name',   v:fullName},
                  {k:'Role',        v:user?.is_staff?'Administrator':'Standard User'},
                  {k:'Predictions', v:stats.total_predictions},
                ].map(r=>(
                  <div key={r.k} className="pf-info-row">
                    <span className="pf-info-key">{r.k}</span>
                    <span className="pf-info-val">{r.v}</span>
                  </div>
                ))}
              </div>

              {/* Recent Predictions */}
              <div className="pf-section">
                <div className="pf-section-title"><i className="bi bi-clock-history"/>Recent Predictions</div>
                {stats.recent_predictions.length > 0 ? (
                  <>
                    {stats.recent_predictions.map(p=>(
                      <div key={p.id} className="pf-pred-row">
                        <div><span className="pf-pred-hobby"><i className="bi bi-magic"/>{p.predicted_hobby}</span></div>
                        <div style={{textAlign:'right'}}>
                          {p.confidence_score && <div className="pf-pred-conf">{p.confidence_score}%</div>}
                          <div className="pf-pred-date">{new Date(p.predicted_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:'1rem'}}><Link to="/history" style={{fontSize:'.82rem',color:'#4361ee',fontWeight:600,textDecoration:'none'}}>View all predictions →</Link></div>
                  </>
                ) : (
                  <div style={{textAlign:'center',padding:'24px 0',color:'#9ca3af',fontSize:'.88rem'}}>
                    <i className="bi bi-clock-history" style={{fontSize:'2rem',opacity:.35,display:'block',marginBottom:'10px'}}/>
                    No predictions yet. <Link to="/predict" style={{color:'#4361ee',fontWeight:600}}>Make your first one!</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
