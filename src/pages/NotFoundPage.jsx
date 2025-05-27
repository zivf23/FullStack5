// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
// ודא שקובץ ה-CSS הראשי שלך (למשל App.css) מיובא איפשהו באפליקציה,
// או שאתה מייבא קובץ CSS ספציפי לעמוד זה אם יש צורך.

export default function NotFoundPage() {
  return (
    <div className="not-found-page"> {/* className לעיצוב */}
      <h1 className="not-found-title">404</h1>
      <p className="not-found-subtitle">אופס! העמוד לא נמצא.</p>
      <p className="not-found-text">נראה שהעמוד שחיפשת אבד בדרך או שאינו קיים.</p>
      <Link to="/home" className="button button-primary not-found-link"> {/* שימוש ב-className של כפתור */}
        חזור לדף הבית
      </Link>
    </div>
  );
}
