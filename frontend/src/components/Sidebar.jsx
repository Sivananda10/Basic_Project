import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sb_collapsed') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const overlayRef = useRef(null);

  const toggleDesktop = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sb_collapsed', next ? '1' : '0');
  };

  // Keep sb-content margin in sync with collapsed state
  useEffect(() => {
    const el = document.getElementById('sb-content');
    if (el) el.classList.toggle('collapsed-offset', collapsed);
  }, [collapsed]);

  // Apply on mount from saved state
  useEffect(() => {
    const el = document.getElementById('sb-content');
    if (el && collapsed) el.classList.add('collapsed-offset');
  }, []); // eslint-disable-line

  const closeMobile = () => setMobileOpen(false);
  const openMobile  = () => setMobileOpen(true);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    addToast('You have been logged out successfully', 'success');
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase();
  const displayName = user?.first_name || user?.username || '';

  const activeClass = ({ isActive }) => `sb-link${isActive ? ' active' : ''}`;

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className={`sb-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>

        {/* Brand header */}
        <div className="sb-brand-header">
          {!collapsed && (
            <Link to="/" className="sb-brand">
              <div className="sb-brand-icon"><i className="bi bi-stars" /></div>
              <div>
                <div className="sb-brand-text">HobbyPredictor</div>
                <div className="sb-brand-sub">Kids · Ages 5–17</div>
              </div>
            </Link>
          )}
          <button
            className="sb-desk-toggle"
            onClick={toggleDesktop}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={collapsed ? { margin: '18px auto' } : {}}
          >
            <i className="bi bi-chevron-left" />
          </button>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <NavLink to="/" end className={activeClass} title="Home"><i className="bi bi-house-door" /><span className="sb-link-text">Home</span></NavLink>

          {user ? (
            <>
              <NavLink to="/predict"   className={activeClass} title="Predict Hobby"><i className="bi bi-magic" /><span className="sb-link-text">Predict Hobby</span></NavLink>
              <NavLink to="/history"   className={activeClass} title="My History"><i className="bi bi-clock-history" /><span className="sb-link-text">My History</span></NavLink>
              <NavLink to="/profile"   className={activeClass} title="My Profile"><i className="bi bi-person-circle" /><span className="sb-link-text">My Profile</span></NavLink>
              {user.is_staff && (
                <NavLink to="/dashboard" className={activeClass} title="Dashboard"><i className="bi bi-speedometer2" /><span className="sb-link-text">Dashboard</span></NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login"    className={activeClass} title="Sign In"><i className="bi bi-box-arrow-in-right" /><span className="sb-link-text">Sign In</span></NavLink>
              <NavLink to="/register" className={activeClass} title="Register"><i className="bi bi-person-plus" /><span className="sb-link-text">Register</span></NavLink>
            </>
          )}

          <div className="sb-nav-divider" />

          <NavLink to="/about"   className={activeClass} title="About"><i className="bi bi-info-circle" /><span className="sb-link-text">About</span></NavLink>
          <NavLink to="/contact" className={activeClass} title="Contact"><i className="bi bi-envelope" /><span className="sb-link-text">Contact</span></NavLink>
        </nav>

        {/* User bottom panel */}
        {user && (
          <div className="sb-user">
            <Link to="/profile" className="sb-avatar" title="My Profile">{initial}</Link>
            <span className="sb-user-name">{displayName}</span>
            <Link to="/profile" className="sb-logout" title="Profile" style={{marginRight:'2px'}}><i className="bi bi-person-circle" /></Link>
            <button className="sb-logout" title="Logout" onClick={handleLogoutClick} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
              <i className="bi bi-box-arrow-right" />
            </button>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      <div ref={overlayRef} className={`sb-overlay${mobileOpen ? ' active' : ''}`} onClick={closeMobile} />

      {/* Mobile topbar */}
      <div className="sb-topbar">
        <button className="sb-toggle" onClick={mobileOpen ? closeMobile : openMobile} aria-label="Toggle menu">
          <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} />
        </button>
        <Link to="/" className="sb-topbar-brand"><i className="bi bi-stars" /> HobbyPredictor</Link>
      </div>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="logout-overlay" onClick={handleLogoutCancel}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <i className="bi bi-box-arrow-right" />
            </div>
            <h3>Logout Confirmation</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="logout-modal-btns">
              <button className="logout-btn-cancel" onClick={handleLogoutCancel}>
                Cancel
              </button>
              <button className="logout-btn-confirm" onClick={handleLogoutConfirm}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
