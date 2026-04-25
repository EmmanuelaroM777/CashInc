import React, { useState, useContext } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, User, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const LoginPage = () => {
  const { user, login, register } = useContext(AuthContext);
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

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.role, formData.company_code);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error en la autenticación. Por favor intente de nuevo.');
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
        <div className="glass-panel p-8 shadow-2xl border border-[rgba(255,255,255,0.1)]">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <button onClick={() => navigate('/')} className="mb-6 text-[var(--text-secondary)] hover:text-white transition-colors text-sm flex items-center gap-2 self-start">
              ← Volver al inicio
            </button>
            <img src="/logo.png" alt="CashInc Logo" className="w-20 h-20 object-contain mb-4 cursor-pointer drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" onClick={() => navigate('/')} />
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Bienvenido a CashInc' : 'Crear Cuenta'}
            </h1>
            <p className="text-[var(--text-secondary)] text-center">
              Plataforma de gestión financiera de infraestructura
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
                label="Nombre Completo"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                placeholder="Ej. Juan Pérez"
                required
              />
            )}
            
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              placeholder="correo@ejemplo.com"
              required
            />
            
            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              placeholder="••••••••"
              required
            />

            {!isLogin && (
              <div className="space-y-1.5 w-full">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Rol de Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Shield size={18} />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-200"
                    style={{ backdropFilter: 'blur(4px)' }}
                    required
                  >
                    <option value="trabajador" className="bg-[var(--bg-secondary)]">Trabajador (Solo Lectura)</option>
                    <option value="admin" className="bg-[var(--bg-secondary)]">Administrador</option>
                  </select>
                </div>
              </div>
            )}

            {!isLogin && formData.role === 'trabajador' && (
              <div className="animate-fade-in">
                <Input
                  label="Código de Empresa"
                  name="company_code"
                  type="text"
                  value={formData.company_code}
                  onChange={handleChange}
                  icon={Building2}
                  placeholder="Ej. X7B9A2"
                  required
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Pídele este código a tu administrador para unirte a su cuenta.</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="mt-6"
            >
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-8 pt-6 border-t border-[var(--border-light)] text-center text-sm">
            <span className="text-[var(--text-secondary)]">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            {' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[var(--accent-primary)] hover:text-white font-bold transition-colors underline decoration-transparent hover:decoration-white underline-offset-4 ml-1"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
