import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarFront, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth(); const navigate = useNavigate();
  const [form,setForm]=useState({name:'',email:'',phone:'',password:'',role:'customer'}); const [error,setError]=useState('');
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async e=>{e.preventDefault();setError('');try{const user=await register(form);navigate(user.role==='owner'?'/owner':'/dashboard');}catch(err){setError(err.message);}};
  return <section className="auth-page"><div className="auth-card"><div className="auth-brand"><span className="brand-icon"><CarFront/></span><span>Join GoDrive</span></div><h1>Create your account</h1><p className="muted">A few details and you are ready to go.</p><form onSubmit={submit} className="form-stack"><label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" required/></label><label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required/></label><label>Phone number<input name="phone" value={form.phone} onChange={change} placeholder="Optional phone number"/></label><label>Password<input name="password" type="password" minLength="8" value={form.password} onChange={change} placeholder="At least 8 characters" required/></label><label>Account type<select name="role" value={form.role} onChange={change}><option value="customer">I want to rent a car</option><option value="owner">I want to list my car</option></select></label>{error&&<p className="form-error">{error}</p>}<button className="btn btn-primary btn-block" disabled={loading}><UserPlus size={17}/> {loading?'Creating account...':'Create account'}</button></form><p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p><p className="demo-note">Your account details are saved in MongoDB.</p></div></section>;
}
