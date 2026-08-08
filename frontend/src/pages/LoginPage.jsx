import React, { useState, useContext } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, User, Shield, KeyRound } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import apiClient from '../api/client';

const LoginPage = () => {
  const { user, login, register } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(!location.state?.register);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Send code, 2: Reset password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'trabajador',
    company_code: '',
    recoveryCode: '',
    newPassword: ''
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

  const handleSendRecoveryCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email: formData.email });
      setSuccess(`Código de verificación enviado a ${formData.email}. (Código simulado en terminal: ${response.data.code_simulated})`);
      setRecoveryStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo enviar el código de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate password strength
    const pwd = formData.newPassword;
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

    try {
      await apiClient.post('/auth/reset-password', {
        email: formData.email,
        token: formData.recoveryCode,
        new_password: formData.newPassword
      });
      setSuccess("Contraseña restablecida correctamente. Iniciando sesión...");
      
      // Auto login
      setTimeout(async () => {
        try {
          await login(formData.email, formData.newPassword);
          navigate('/dashboard');
        } catch (authErr) {
          setIsForgotPassword(false);
          setIsLogin(true);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo restablecer la contraseña. Verifique el código.");
    } finally {
      setLoading(false);
    }
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
              {isForgotPassword 
                ? "Recuperar Contraseña" 
                : (isLogin ? t('login.welcomeTitle') : t('login.createTitle'))}
            </h1>
            <p className="text-[var(--text-secondary)] text-center text-sm">
              {isForgotPassword 
                ? "Restablezca el acceso a su cuenta mediante código"
                : t('login.subtitle')}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg text-[var(--status-danger)] text-sm animate-fade-in text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-lg text-[var(--status-success)] text-sm animate-fade-in text-center">
              {success}
            </div>
          )}

          {/* FORGOT PASSWORD FORM FLOW */}
          {isForgotPassword ? (
            <div className="space-y-4">
              {recoveryStep === 1 ? (
                <form onSubmit={handleSendRecoveryCode} className="space-y-4">
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
                  <Button type="submit" fullWidth isLoading={loading}>
                    Enviar Código de Recuperación
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <Input
                    label="Código de Verificación (6 dígitos)"
                    name="recoveryCode"
                    type="text"
                    value={formData.recoveryCode}
                    onChange={handleChange}
                    icon={KeyRound}
                    placeholder="Ej. 123456"
                    required
                  />
                  <Input
                    label="Nueva Contraseña"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    icon={Lock}
                    placeholder="••••••••"
                    required
                  />

                  {/* Password strength indicators */}
                  {formData.newPassword.length > 0 && (
                    <div className="space-y-1.5 px-1 animate-fade-in">
                      <p className="text-xs text-[var(--text-muted)] mb-1">{t('login.passwordReqs')}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${formData.newPassword.length >= 8 ? 'bg-[var(--status-success)] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)]'}`}>
                          {formData.newPassword.length >= 8 ? '✓' : '✗'}
                        </span>
                        <span className={formData.newPassword.length >= 8 ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}>{t('login.minChars')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${/[A-Z]/.test(formData.newPassword) ? 'bg-[var(--status-success)] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)]'}`}>
                          {/[A-Z]/.test(formData.newPassword) ? '✓' : '✗'}
                        </span>
                        <span className={/[A-Z]/.test(formData.newPassword) ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}>{t('login.uppercase')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${/[0-9]/.test(formData.newPassword) ? 'bg-[var(--status-success)] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)]'}`}>
                          {/[0-9]/.test(formData.newPassword) ? '✓' : '✗'}
                        </span>
                        <span className={/[0-9]/.test(formData.newPassword) ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}>{t('login.number')}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" fullWidth isLoading={loading}>
                    Restablecer Contraseña
                  </Button>
                </form>
              )}

              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setRecoveryStep(1);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full text-center text-xs text-[var(--text-secondary)] hover:text-white transition-colors underline pt-2 block"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          ) : (
            /* STANDARD LOGIN / REGISTER FLOW */
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
              
              <div className="space-y-1">
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
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs text-[var(--text-muted)] hover:text-white transition-colors block ml-auto underline"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                )}
              </div>

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
                      required
                    >
                      <option value="trabajador" className="bg-[var(--bg-secondary)]">{t('login.worker')}</option>
                      <option value="financiero" className="bg-[var(--bg-secondary)]">Responsable Financiero</option>
                      <option value="mantenimiento" className="bg-[var(--bg-secondary)]">Supervisor de Mantenimiento</option>
                      <option value="admin" className="bg-[var(--bg-secondary)]">{t('login.admin')}</option>
                    </select>
                  </div>
                </div>
              )}

              {!isLogin && (formData.role === 'trabajador' || formData.role === 'mantenimiento' || formData.role === 'financiero') && (
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
          )}

          {/* Toggle Login/Register */}
          {!isForgotPassword && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
