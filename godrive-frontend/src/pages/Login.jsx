import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarFront, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault(); setError('');
    try { const user = await login(email, password); navigate(user.role === 'owner' ? '/owner' : user.role === 'admin' ? '/admin' : '/dashboard'); }
    catch (err) { setError(err.message); }
  };
  return <section className="auth-page"><div className="auth-card"><div className="auth-brand"><span className="brand-icon"><CarFront/></span><span>Welcome back</span></div><h1>Log in to your account</h1><p className="muted">Pick up where your next journey begins.</p><form onSubmit={submit} className="form-stack"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required/></label>{error&&<p className="form-error">{error}</p>}<button className="btn btn-primary btn-block" disabled={loading}><LockKeyhole size={17}/> {loading?'Logging in...':'Log in'}</button></form><p className="auth-switch">New to GoDrive? <Link to="/register">Create an account</Link></p><p className="demo-note">Your account is authenticated securely by the GoDrive backend.</p></div></section>;
}
