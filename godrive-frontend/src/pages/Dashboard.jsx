import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, CarFront, Clock3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function Dashboard() {
  const {user}=useAuth();const [params]=useSearchParams();const [bookings,setBookings]=useState([]);const [error,setError]=useState('');const [busy,setBusy]=useState('');
  const load=()=>apiRequest('/bookings/my').then(data=>setBookings(data.bookings||[])).catch(err=>setError(err.message));
  useEffect(()=>{load();},[]);
  const cancel=async id=>{setBusy(id);setError('');try{await apiRequest(`/bookings/${id}/status`,{method:'PATCH',body:JSON.stringify({status:'cancelled'})});await load();}catch(err){setError(err.message);}finally{setBusy('');}};
  const money=n=>Number(n||0).toLocaleString('en-IN');
  return <section className="section container page-section"><div className="dashboard-heading"><div><span className="eyebrow">CUSTOMER SPACE</span><h1>Hello, {user.name}</h1><p className="muted">Manage your trips and booking requests.</p></div><Link to="/cars" className="btn btn-primary">Find a car</Link></div>{params.get('booked')&&<div className="success-banner">Your booking request was submitted successfully.</div>}{error&&<p className="form-error">{error}</p>}<div className="stat-grid"><div className="stat-card"><CalendarDays/><span>Total bookings</span><b>{bookings.length}</b></div><div className="stat-card"><Clock3/><span>Pending requests</span><b>{bookings.filter(b=>b.status==='pending').length}</b></div><div className="stat-card"><CarFront/><span>Account type</span><b>Customer</b></div></div><div className="dashboard-panel"><div className="panel-heading"><h2>My bookings</h2><span className="muted">{bookings.length} total</span></div>{bookings.length?bookings.map(b=><div className="booking-list-item" key={b._id}><div><b>{b.car?.title||'Car booking'}</b><p className="muted">{new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}</p><small className="muted">{b.pickupLocation} · {b.totalDays} days</small></div><div className="booking-item-right"><b>₹{money(b.totalAmount)}</b><span className="status-pill">{b.status}</span>{b.status==='pending'&&<button className="btn btn-small btn-dark" disabled={busy===b._id} onClick={()=>cancel(b._id)}>{busy===b._id?'Cancelling...':'Cancel'}</button>}</div></div>):<div className="empty-state"><h3>No bookings yet</h3><p>Your upcoming trips will appear here.</p><Link to="/cars" className="text-link">Explore available cars →</Link></div>}</div></section>;
}
