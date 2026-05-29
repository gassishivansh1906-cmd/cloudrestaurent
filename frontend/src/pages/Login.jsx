import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 style={{ marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 22 }}>Log in to manage your restaurant.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p style={{ color: 'var(--muted)', marginTop: 18, textAlign: 'center' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
        </p>
        <p style={{ color: 'var(--muted)', marginTop: 10, fontSize: 13, textAlign: 'center' }}>
          Demo admin: admin@cloud.com / Admin@123
        </p>
      </div>
    </div>
  );
}
