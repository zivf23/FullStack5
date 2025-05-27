import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App'; // ייבוא useAuth מ-App.js
import { registerUser } from '../apiService';

// רכיב פנימי לטופס התחברות
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err.message || 'התחברות נכשלה');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form"> {/* שינוי className */}
      <h2>התחברות</h2>
      <div>
        <label htmlFor="login-username">שם משתמש:</label>
        <input id="login-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="login-password">סיסמה:</label>
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="form-error-message">{error}</p>} {/* שינוי className */}
      <button type="submit">התחבר</button>
    </form>
  );
}

// רכיב פנימי לטופס הרשמה (שלב 1)
function RegisterFormStep1({ onContinue }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== verifyPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }
        onContinue({ username, password });
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form"> {/* שינוי className */}
            <h2>הרשמה - שלב 1</h2>
            <div>
                <label htmlFor="reg-username">שם משתמש:</label>
                <input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="reg-password">סיסמה:</label>
                <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="reg-verify-password">אימות סיסמה:</label>
                <input id="reg-verify-password" type="password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} required />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button type="submit" className="button-green">המשך להשלמת פרטים</button> {/* className חדש */}
        </form>
    );
}

// רכיב פנימי לטופס הרשמה (שלב 2)
function RegisterFormStep2({ initialData, onRegister }) {
    const [formData, setFormData] = useState({
        username: initialData.username,
        password: initialData.password,
        name: '',
        email: '',
        phone: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userDataToRegister = {
                ...formData,
                website: formData.password,
            };
            delete userDataToRegister.password;
            await onRegister(userDataToRegister);
        } catch (err) {
            setError(err.message || 'רישום נכשל');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="auth-form"> {/* שינוי className */}
            <h2>הרשמה - השלמת פרטים</h2>
            <p className="form-info-text">שם משתמש: {formData.username}</p> {/* className חדש */}
            <div>
                <label htmlFor="name">שם מלא:</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="email">אימייל:</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
             <div>
                <label htmlFor="phone">טלפון:</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button type="submit" className="button-green">הירשם</button> {/* className חדש */}
        </form>
    );
}


export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [registrationData, setRegistrationData] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home";

  const handleLogin = async (username, password) => {
    await login(username, password);
    navigate(from, { replace: true });
  };

  const handleRegisterContinue = (data) => {
    setRegistrationData(data);
    setRegistrationStep(2);
  };

  const handleRegisterSubmit = async (userData) => {
    const newUser = await registerUser(userData);
    await login(newUser.username, newUser.website);
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page-container"> {/* שינוי className */}
      <div className="auth-form-wrapper"> {/* שינוי className */}
        {isRegistering ? (
            registrationStep === 1 ? (
                <RegisterFormStep1 onContinue={handleRegisterContinue} />
            ) : (
                <RegisterFormStep2 initialData={registrationData} onRegister={handleRegisterSubmit} />
            )
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setRegistrationStep(1);
          }}
          className="form-switch-link" // שינוי className
        >
          {isRegistering ? 'יש לך כבר חשבון? התחבר' : 'אין לך חשבון? הירשם'}
        </button>
      </div>
    </div>
  );
}
