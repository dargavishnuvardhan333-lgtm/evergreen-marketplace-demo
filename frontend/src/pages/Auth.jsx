import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { API_ENABLED } from '../services/api.js';

export default function Auth({ register = false }) {
  const { user, authLoading, authenticate } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!authLoading && user) return <Navigate to={location.state?.from?.pathname || '/account'} replace />;
  if (!API_ENABLED) return (
    <section className="page-container empty-state">
      <p className="eyebrow">DEMO STORE</p>
      <h1>Accounts aren’t <em>enabled here.</em></h1>
      <p>This public demo uses a sample catalog and browser-only cart. Account features require a separately configured store API.</p>
      <Link className="button button-dark" to="/shop">Browse the collection</Link>
    </section>
  );

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authenticate(register ? '/auth/register' : '/auth/login', form);
      navigate(location.state?.from?.pathname || '/account', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel"><p className="eyebrow">{register ? 'A GOOD PLACE TO BEGIN' : 'WELCOME BACK'}</p><h1>{register ? <>Make yourself<br /><em>at home.</em></> : <>Good to see<br /><em>you again.</em></>}</h1><p className="muted">{register ? 'Create an account to keep track of the things you love.' : 'Sign in to find your orders and saved details.'}</p></div>
      <form className="form-card auth-form" onSubmit={submit}>
        <h2>{register ? 'Create your account' : 'Sign in'}</h2>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        {register && <label className="form-field">Your name<input required autoComplete="name" maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>}
        <label className="form-field">Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label className="form-field">Password<input required type="password" minLength="8" maxLength="128" autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        <button className="button button-dark button-full" disabled={submitting}>{submitting ? 'One moment…' : register ? 'Create account' : 'Sign in'}</button>
        <p className="form-switch">{register ? 'Already have an account?' : 'New around here?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
      </form>
    </section>
  );
}
