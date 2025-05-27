// src/pages/HomePage.js
import React from 'react';
import { useAuth } from '../App'; // ייבוא useAuth מ-App.js
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return <p className="loading-text">טוען פרטי משתמש או שאינך מחובר...</p>;
  }

  return (
    <div className="home-page">
      <h1 className="page-title">ברוך הבא, {user.name || user.username}!</h1>
      <p className="home-subtitle">זהו לוח הבקרה האישי שלך. מכאן תוכל לנהל את המידע שלך.</p>
      
      <div className="home-navigation-grid">
        <Link to={`/users/${user.id}/todos`} className="nav-card card-todos">
          <span className="nav-card-icon">📝</span>
          <span className="nav-card-title">ניהול משימות</span>
        </Link>
        <Link to={`/users/${user.id}/posts`} className="nav-card card-posts">
          <span className="nav-card-icon">📰</span>
          <span className="nav-card-title">ניהול פוסטים</span>
        </Link>
        <Link to={`/users/${user.id}/albums`} className="nav-card card-albums">
          <span className="nav-card-icon">🖼️</span>
          <span className="nav-card-title">ניהול אלבומים</span>
        </Link>
      </div>

      <div className="user-info-card">
        <h2 className="user-info-title">מידע אישי</h2>
        <p><strong>שם מלא:</strong> {user.name}</p>
        <p><strong>שם משתמש:</strong> {user.username}</p>
        <p><strong>אימייל:</strong> {user.email}</p>
        {/* אפשר להוסיף כאן עוד פרטים אם קיימים באובייקט המשתמש */}
      </div>
    </div>
  );
}
