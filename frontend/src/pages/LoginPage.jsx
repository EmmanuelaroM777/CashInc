import React, { useState, useContext } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, User, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const LoginPage = () => {
  const { user, login, register } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(!location.state?.register);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'trabajador', // Default role for registration
    company_code: '',
  });

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend password validation (registration only)
    if (!isLogin) {
      const pwd = formData.password;
      if (pwd.length < 8) {
        setError(t('login.errMinChars'));
        setLoading(false);
        return;
      }
      if (!/[A-Z]/.test(pwd)) {
        setError(t('login.errUppercase'));
        setLoading(false);
        return;
      }
      if (!/[0-9]/.test(pwd)) {
        setError(t('login.errNumber'));
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.role, formData.company_code);
      }
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      // Pydantic validation errors come as an array
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join('. '));
      } else {
        setError(detail || t('login.errorAuth'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-primary)] opacity-10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-tertiary)] opacity-10 blur-[150px] pointer-events-none"></div>
      
      <div className="w-[400px] max-w-[95vw] animate-slide-up z-10 mx-auto">
        <div className="glass-panel p-8 shadow-2xl border border-[var(--border-light)]">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <button onClick={() => navigate('/')} className="mb-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center gap-2 self-start">
              {t('login.backToHome')}
            </button>
            <img src="/logo.png" alt="CashInc Logo" className="w-20 h-20 object-contain mb-4 cursor-pointer drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" onClick={() => navigate('/')} />
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {isLogin ? t('login.welcomeTitle') : t('login.createTitle')}
            </h1>
            <p className="text-[var(--text-secondary)] text-center">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg text-[var(--status-danger)] text-sm animate-fade-in text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label={t('login.fullName')}
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                placeholder={t('login.namePlaceholder')}
                required
              />
            )}
            
            <Input
              label={t('login.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              placeholder={t('login.emailPlaceholder')}
              required
            />
            
            <Input
              label={isLogin ? t('login.password') : t('login.createPassword')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              placeholder={t('login.passwordPlaceholder')}
              required
              minLength={isLogin ? undefined : 8}
            />

            {/* Password Strength Indicators (only on register) */}
            {!isLogin && formData.password.length > 0 && (
              <div className="space-y-1.5 px-1 animate-fade-in">
                <p className="text-xs text-[var(--text-muted)] mb-1">{t('login.passwordReqs')}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${formData.password.length >= 8 ? 'bg-[var(--status-success)] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)]'}`}>
                    {formData.password.length >= 8 ? '✓' : '✗'}
                  </span>
                  <span className={formData.password.length >= 8 ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}>{t('login.minChars')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${/[A-Z]/.test(formData.password) ? 'bg-[var(--status-success)] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)]'}`}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '✗'}
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}>{t('login.uppercase')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${/[0-9]/.test(formData.password) ? 'bg-[var(--status-success)] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)]'}`}>
                    {/[0-9]/.test(formData.password) ? '✓' : '✗'}
                  </span>
                  <span className={/[0-9]/.test(formData.password) ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}>{t('login.number')}</span>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5 w-full">
                <label className="text-sm font-medium text-[var(--text-secondary)]">{t('login.userRole')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Shield size={18} />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-200"
                    style={{ backdropFilter: 'blur(4px)' }}
                    required
                  >
                    <option value="trabajador" className="bg-[var(--bg-secondary)]">{t('login.worker')}</option>
                    <option value="admin" className="bg-[var(--bg-secondary)]">{t('login.admin')}</option>
                  </select>
                </div>
              </div>
            )}

            {!isLogin && formData.role === 'trabajador' && (
              <div className="animate-fade-in">
                <Input
                  label={t('login.companyCode')}
                  name="company_code"
                  type="text"
                  value={formData.company_code}
                  onChange={handleChange}
                  icon={Building2}
                  placeholder={t('login.companyCodePlaceholder')}
                  required
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">{t('login.companyCodeHint')}</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="mt-6"
            >
              {isLogin ? t('login.loginBtn') : t('login.registerBtn')}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-8 pt-6 border-t border-[var(--border-light)] text-center text-sm">
            <span className="text-[var(--text-secondary)]">
              {isLogin ? t('login.noAccount') : t('login.haveAccount')}
            </span>
            {' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[var(--accent-primary)] hover:text-[var(--text-primary)] font-bold transition-colors underline decoration-transparent hover:decoration-[var(--text-primary)] underline-offset-4 ml-1"
            >
              {isLogin ? t('login.registerLink') : t('login.loginLink')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
