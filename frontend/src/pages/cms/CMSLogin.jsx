import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CMSLogin.css';

export default function CMSLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/cms');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cms-login">
      <div className="cms-login__card glass fade-up">
        <div className="cms-login__header">
          <span className="cms-login__icon">🌲</span>
          <h1 className="heading-2">CMS Login</h1>
          <p className="body-sm" style={{ color: 'var(--text-tertiary)' }}>Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="cms-login__form">
          <div className="cms-login__field">
            <label className="cms-login__label">Email</label>
            <input
              type="email"
              className="cms-login__input"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>
          <div className="cms-login__field">
            <label className="cms-login__label">Password</label>
            <input
              type="password"
              className="cms-login__input"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="cms-login__error">{error}</p>}

          <button type="submit" className="btn btn-primary cms-login__submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
