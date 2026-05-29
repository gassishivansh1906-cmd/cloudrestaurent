import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-wrap">
      <div className="center">
        <div className="text-gradient" style={{ fontSize: 90, fontWeight: 800 }}>404</div>
        <h2 style={{ marginBottom: 10 }}>Page not found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 22 }}>The page you're looking for has left the kitchen.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </div>
  );
}
