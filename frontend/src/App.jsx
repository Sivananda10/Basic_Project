import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar         from './components/Sidebar';
import Footer          from './components/Footer';
import ProtectedRoute  from './components/ProtectedRoute';
import AdminRoute      from './components/AdminRoute';

import HomePage            from './pages/HomePage';
import AboutPage           from './pages/AboutPage';
import ContactPage         from './pages/ContactPage';
import AuthPage            from './pages/AuthPage';
import ProfilePage         from './pages/ProfilePage';
import PredictPage         from './pages/PredictPage';
import ResultPage          from './pages/ResultPage';
import HistoryPage         from './pages/HistoryPage';
import FeedbackPage        from './pages/FeedbackPage';
import AdminDashboardPage  from './pages/AdminDashboardPage';

function Layout() {
  return (
    <div className="sb-layout">
      <Sidebar />
      <div className="sb-content" id="sb-content">
        <div className="sb-page">
          <main>
            <Routes>
              {/* Public */}
              <Route path="/"         element={<HomePage />} />
              <Route path="/about"    element={<AboutPage />} />
              <Route path="/contact"  element={<ContactPage />} />
              <Route path="/login"    element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />

              {/* Authenticated */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile"      element={<ProfilePage />} />
                <Route path="/predict"      element={<PredictPage />} />
                <Route path="/result"       element={<ResultPage />} />
                <Route path="/history"      element={<HistoryPage />} />
                <Route path="/feedback/:id" element={<FeedbackPage />} />
                <Route path="/feedback"     element={<FeedbackPage />} />
              </Route>

              {/* Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/dashboard" element={<AdminDashboardPage />} />
              </Route>
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
