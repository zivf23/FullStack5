// src/App.js

import React, { useState, useContext, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './styles.css'; // <-- ייבוא קובץ ה-CSS שלנו

// --- Pages ---
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import TodosPage from './pages/TodosPage';
import PostsPage from './pages/PostsPage';
import AlbumsPage from './pages/AlbumsPage';
import NotFoundPage from './pages/NotFoundPage';

// --- API Service ---
import { getUserByUsername } from './apiService';


// --- Auth Context ---
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('app_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("שגיאה בטעינת משתמש מ-localStorage:", error);
      localStorage.removeItem('app_user');
    }
    setLoadingAuth(false);
  }, []);

  const login = async (username, password) => {
    try {
      const users = await getUserByUsername(username);
      if (users.length > 0 && users[0].website === password) {
        const loggedInUser = { id: users[0].id, username: users[0].username, name: users[0].name, email: users[0].email };
        setUser(loggedInUser);
        localStorage.setItem('app_user', JSON.stringify(loggedInUser));
        return loggedInUser;
      } else {
        throw new Error('שם משתמש או סיסמה שגויים');
      }
    } catch (error) {
      console.error("שגיאת התחברות:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  const value = { user, login, logout, loadingAuth };

  if (loadingAuth) {
    return <div className="loading-fullscreen">טוען אימות...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Navbar Component ---
function Navbar() {
  const { user, logout } = useAuth();
  console.log("Navbar rendered with user:", user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to={user ? "/home" : "/auth"} className="navbar-brand">
          מנהל תוכן אישי
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/home" className="nav-link">בית</Link>
              <Link to={`/users/${user.id}/todos`} className="nav-link">משימות</Link>
              <Link to={`/users/${user.id}/posts`} className="nav-link">פוסטים</Link>
              <Link to={`/users/${user.id}/albums`} className="nav-link">אלבומים</Link>
              <span className="navbar-user-greeting">שלום, {user.name || user.username}</span>
              <button onClick={handleLogout} className="button button-logout">
                התנתק
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-link">כניסה / הרשמה</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// --- ProtectedRoute Component ---
function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return <div className="loading-fullscreen">בודק הרשאות...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

// --- AppContent (for conditional routing after auth check) ---
function AppContent() {
    const { user, loadingAuth } = useAuth();

    if (loadingAuth) {
        return null; 
    }

    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/users/:userId/todos" element={<ProtectedRoute><TodosPage /></ProtectedRoute>} />
            <Route path="/users/:userId/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
            <Route path="/users/:userId/albums" element={<ProtectedRoute><AlbumsPage /></ProtectedRoute>} />
            <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/auth" replace />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}


// --- Main App Component ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content container">
            <AppContent />
          </main>
          <footer className="app-footer">
            <p>© {new Date().getFullYear()} פרויקט ניהול תוכן אישי</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
