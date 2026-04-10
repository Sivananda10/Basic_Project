import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🎯</span>
          <span className="brand-text">KidHobby<span className="brand-accent">AI</span></span>
        </Link>
      </div>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>

        {user && (
          <>
            <NavLink to="/predict" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Predict</NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>History</NavLink>
            {user.is_staff && (
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
            )}
          </>
        )}
      </div>

      <div className="navbar-auth">
        {user ? (
          <div className="user-menu">
            <NavLink to="/profile" className="user-avatar-btn" title="Profile">
              <div className="avatar-circle">
                {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
              </div>
              <span className="user-name">{user.first_name || user.username}</span>
            </NavLink>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
