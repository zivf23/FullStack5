import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../App.jsx'; 
import { getUserByUsername, registerUser } from '../apiService';


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
      // הניווט יתבצע על ידי AuthPage לאחר קריאה מוצלחת ל-onLogin
    } catch (err) {
      setError(err.message || 'התחברות נכשלה');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>התחברות</h2>
      <div>
        <label htmlFor="login-username">שם משתמש:</label>
        <input id="login-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="login-password">סיסמה:</label>
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="form-error-message">{error}</p>}
      <button type="submit" className="button button-primary">התחבר</button>
    </form>
  );
}

// רכיב פנימי לטופס הרשמה (שלב 1 - שם משתמש וסיסמה)
function RegisterFormStep1({ onContinue, onUsernameTaken }) { 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== verifyPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }
        setLoading(true);
        try {
            const existingUsers = await getUserByUsername(username);
            if (existingUsers.length > 0) {
                setError('שם המשתמש הזה כבר תפוס. אנא בחר שם אחר.');
                if(onUsernameTaken) onUsernameTaken(); 
            } else {
                onContinue({ username, password });
            }
        } catch (apiError) {
            setError(apiError.message || 'אירעה שגיאה בבדיקת שם המשתמש.');
            if(onUsernameTaken) onUsernameTaken();
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>הרשמה - שלב 1</h2>
            <div>
                <label htmlFor="reg-username">שם משתמש:</label>
                <input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
            </div>
            <div>
                <label htmlFor="reg-password">סיסמה:</label>
                <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>
            <div>
                <label htmlFor="reg-verify-password">אימות סיסמה:</label>
                <input id="reg-verify-password" type="password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} required disabled={loading} />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button type="submit" className="button-green" disabled={loading}>
                {loading ? 'בודק...' : 'המשך להשלמת פרטים'}
            </button>
        </form>
    );
}

// רכיב פנימי לטופס הרשמה (שלב 2 - השלמת פרטים)
function RegisterFormStep2({ initialData, onRegister }) {
    const [formData, setFormData] = useState({
        username: initialData.username,
        passwordForWebsite: initialData.password, // שדה זמני לשמירת הסיסמה המקורית
        name: '',
        email: '',
        phone: '',
        // הוסף כאן שדות נוספים אם צריך, למשל address, company כאובייקטים
        address: { street: '', suite: '', city: '', zipcode: '' },
        company: { name: '', catchPhrase: '', bs: '' }
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) { // טיפול בשדות מקוננים כמו address.street
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userDataToRegister = {
                username: formData.username,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                website: formData.passwordForWebsite, // הסיסמה נשמרת בשדה website
                address: formData.address,
                company: formData.company
            };
            await onRegister(userDataToRegister);
        } catch (err) {
            setError(err.message || 'רישום נכשל');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="auth-form"> 
            <h2>הרשמה - השלמת פרטים</h2>
            <p className="form-info-text">שם משתמש: {formData.username}</p> 
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
            {/* דוגמה לשדות מקוננים - אפשר להרחיב */}
            <div>
                <label htmlFor="address.street">רחוב:</label>
                <input id="address.street" name="address.street" type="text" value={formData.address.street} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="address.city">עיר:</label>
                <input id="address.city" name="address.city" type="text" value={formData.address.city} onChange={handleChange} />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button type="submit" className="button-green">הירשם</button> 
        </form>
    );
}


export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [registrationData, setRegistrationData] = useState(null);
  const [authError, setAuthError] = useState(''); 

  const { login } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation(); // לא נשתמש ב-from באופן ישיר לניווט
  // const from = location.state?.from?.pathname || "/home"; // נשאיר למקרה שנרצה בעתיד, אבל לא נשתמש כרגע

  const handleLogin = async (username, password) => {
    setAuthError(''); 
    try {
      await login(username, password);
      navigate("/home", { replace: true }); // *** שינוי: תמיד נווט לדף הבית ***
    } catch (err) {
        setAuthError(err.message || "התחברות נכשלה, אנא בדוק את הפרטים ונסה שוב.");
    }
  };

  const handleRegisterContinue = (data) => {
    setAuthError(''); 
    setRegistrationData(data);
    setRegistrationStep(2);
  };

  const handleUsernameTaken = () => {
    // הודעת השגיאה מוצגת ב-RegisterFormStep1
  };

  const handleRegisterSubmit = async (userData) => {
    setAuthError(''); 
    try {
        const newUser = await registerUser(userData);
        await login(newUser.username, newUser.website); 
        navigate("/home", { replace: true }); // *** שינוי: תמיד נווט לדף הבית ***
    } catch (err) {
        setAuthError(err.message || "רישום נכשל. נסה שוב.");
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-form-wrapper"> 
        {authError && <p className="form-error-message" style={{marginBottom: '1rem', textAlign:'center'}}>{authError}</p>}
        {isRegistering ? (
            registrationStep === 1 ? (
                <RegisterFormStep1 
                    onContinue={handleRegisterContinue} 
                    onUsernameTaken={handleUsernameTaken} 
                />
            ) : (
                registrationData && <RegisterFormStep2 
                    initialData={registrationData} 
                    onRegister={handleRegisterSubmit} 
                />
            )
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setRegistrationStep(1); 
            setAuthError(''); 
          }}
          className="form-switch-link" 
        >
          {isRegistering ? 'יש לך כבר חשבון? התחבר' : 'אין לך חשבון? הירשם'}
        </button>
      </div>
    </div>
  );
}
