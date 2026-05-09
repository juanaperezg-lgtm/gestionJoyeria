import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gem, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-pattern"></div>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Gem size={32} />
          </div>
          <h1>Aura <span>Joyeros</span></h1>
          <p className="login-subtitle">Sistema de Gestión</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          <div className="login-field">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Aura Joyeros — Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
