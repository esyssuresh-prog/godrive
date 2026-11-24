import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BadgeCheck, CalendarDays, CarFront, Check, Clock3, RefreshCw, Search, ShieldCheck, Users, X } from 'lucide-react';
import { apiRequest } from '../services/api';

const money = value => Number(value || 0).toLocaleString('en-IN');
const date = value => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Status({ value }) {
  return <span className={`admin-status status-${String(value || '').toLowerCase()}`}>{value || '—'}</span>;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [summaryData, userData, carData, bookingData] = await Promise.all([
        apiRequest('/admin/summary'), apiRequest('/admin/users'), apiRequest('/admin/cars'), apiRequest('/admin/bookings')
      ]);
      setSummary(summaryData.summary || {});
      setUsers(userData.users || []);
      setCars(carData.cars || []);
      setBookings(bookingData.bookings || []);
    } catch (err) { setError(err.message || 'Unable to load admin data.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredUsers = useMemo(() => users.filter(u => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const filteredCars = useMemo(() => cars.filter(c => `${c.title} ${c.brand} ${c.model} ${c.owner?.name} ${c.status}`.toLowerCase().includes(search.toLowerCase())), [cars, search]);
  const filteredBookings = useMemo(() => bookings.filter(b => `${b.car?.title} ${b.customer?.name} ${b.owner?.name} ${b.status}`.toLowerCase().includes(search.toLowerCase())), [bookings, search]);

  const review = async (id, status) => {
    if (status === 'rejected' && !reason.trim()) { setError('Please enter a reason before rejecting this car.'); return; }
    setBusy(id); setError(''); setNotice('');
    try {
      const body = status === 'rejected' ? { status, rejectionReason: reason.trim() } : { status };
      const result = await apiRequest(`/cars/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) });
      setNotice(result.message || `Car ${status}.`); setRejectId(''); setReason(''); await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(''); }
  };

  const stats = summary ? [
    { label: 'Total users', value: summary.totalUsers, icon: Users, note: `${summary.customers || 0} customers · ${summary.owners || 0} owners` },
    { label: 'Total cars', value: summary.totalCars, icon: CarFront, note: `${summary.approvedCars || 0} approved` },
    { label: 'Pending approvals', value: summary.pendingCars, icon: Clock3, note: `${summary.rejectedCars || 0} rejected` },
    { label: 'Total bookings', value: summary.totalBookings, icon: CalendarDays, note: `${summary.pendingBookings || 0} awaiting owner` },
    { label: 'Confirmed bookings', value: summary.confirmedBookings, icon: BadgeCheck, note: `₹${money(summary.confirmedBookingValue)} booking value` }
  ] : [];

  return <section className="section container page-section admin-page">
    <div className="dashboard-heading admin-heading">
      <div><span className="eyebrow">ADMIN CONTROL CENTER</span><h1>Admin dashboard</h1><p className="muted">Manage users, vehicle listings and bookings across GoDrive.</p></div>
      <button className="btn btn-outline" onClick={load} disabled={loading}><RefreshCw size={16}/> Refresh data</button>
    </div>
    {error && <div className="admin-alert admin-error"><X size={16}/>{error}</div>}
    {notice && <div className="admin-alert admin-success"><Check size={16}/>{notice}</div>}
    <div className="admin-tabs">
      {[['overview','Overview'],['cars','All cars'],['users','Users'],['bookings','Bookings']].map(([key,label]) => <button key={key} className={tab===key?'active':''} onClick={()=>{setTab(key);setSearch('');}}>{label}{key==='cars'&&summary?.pendingCars>0?<span>{summary.pendingCars}</span>:null}</button>)}
    </div>
    {loading ? <div className="admin-loading"><RefreshCw className="spin"/> Loading admin data...</div> : <>
      {tab === 'overview' && <>
        <div className="admin-stat-grid">{stats.map(({label,value,icon:Icon,note})=><article className="admin-stat-card" key={label}><div className="admin-stat-top"><span>{label}</span><Icon size={19}/></div><strong>{Number(value||0).toLocaleString('en-IN')}</strong><small>{note}</small></article>)}</div>
        <div className="admin-overview-grid">
          <article className="admin-panel"><div className="admin-panel-title"><div><h2>Cars awaiting approval</h2><p>Review owner-submitted vehicles.</p></div><button className="text-link" onClick={()=>setTab('cars')}>View all cars</button></div>
            {cars.filter(c=>c.status==='pending').slice(0,5).map(car=><div className="admin-mini-row" key={car._id}><img src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300'} alt=""/><div><b>{car.title || `${car.brand} ${car.model}`}</b><small>{car.owner?.name || 'Owner'} · {car.location}</small></div><Status value={car.status}/></div>)}
            {!cars.some(c=>c.status==='pending')&&<p className="admin-empty">No cars are waiting for approval.</p>}
          </article>
          <article className="admin-panel"><div className="admin-panel-title"><div><h2>Recent bookings</h2><p>Latest customer booking activity.</p></div><button className="text-link" onClick={()=>setTab('bookings')}>View bookings</button></div>
            {bookings.slice(0,5).map(b=><div className="admin-mini-row booking-mini" key={b._id}><div className="admin-mini-icon"><CalendarDays size={18}/></div><div><b>{b.car?.title || 'Car booking'}</b><small>{b.customer?.name || 'Customer'} · {date(b.pickupDate)}</small></div><Status value={b.status}/></div>)}
            {!bookings.length&&<p className="admin-empty">No bookings have been created yet.</p>}
          </article>
        </div>
      </>}

      {tab !== 'overview' && <div className="admin-panel admin-table-panel">
        <div className="admin-panel-title admin-list-heading"><div><h2>{tab==='cars'?'Vehicle listings':tab==='users'?'Registered users':'All bookings'}</h2><p>{tab==='cars'?`${cars.length} vehicle listings`:tab==='users'?`${users.length} registered accounts`:`${bookings.length} bookings`} · showing up to 300 latest records</p></div><label className="admin-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${tab}...`}/></label></div>
        {tab==='cars' && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Car</th><th>Owner</th><th>Price / day</th><th>Status</th><th>Review</th></tr></thead><tbody>{filteredCars.map(car=><tr key={car._id}><td><div className="admin-car-cell"><img src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300'} alt=""/><span><b>{car.title || `${car.brand} ${car.model}`}</b><small>{car.year} · {car.location}</small></span></div></td><td>{car.owner?.name || '—'}<small>{car.owner?.email || ''}</small></td><td>₹{money(car.pricePerDay)}</td><td><Status value={car.status}/></td><td>{car.status==='pending' ? <div className="admin-actions"><button className="admin-approve" disabled={busy===car._id} onClick={()=>review(car._id,'approved')}><Check size={14}/> Approve</button><button className="admin-reject" disabled={busy===car._id} onClick={()=>{setRejectId(rejectId===car._id?'':car._id);setReason('');}}><X size={14}/> Reject</button></div> : <span className="muted">Reviewed</span>}{rejectId===car._id&&<div className="reject-box"><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for rejection"/><button className="admin-reject" disabled={busy===car._id} onClick={()=>review(car._id,'rejected')}>Confirm reject</button></div>}</td></tr>)}</tbody></table>{!filteredCars.length&&<p className="admin-empty">No matching cars found.</p>}</div>}
        {tab==='users' && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead><tbody>{filteredUsers.map(u=><tr key={u._id}><td><b>{u.name}</b></td><td>{u.email}</td><td>{u.phone || '—'}</td><td><Status value={u.role}/></td><td>{date(u.createdAt)}</td></tr>)}</tbody></table>{!filteredUsers.length&&<p className="admin-empty">No matching users found.</p>}</div>}
        {tab==='bookings' && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Booking</th><th>Customer</th><th>Owner</th><th>Rental dates</th><th>Amount</th><th>Status</th></tr></thead><tbody>{filteredBookings.map(b=><tr key={b._id}><td><b>{b.car?.title || 'Car'}</b><small>#{String(b._id).slice(-7)}</small></td><td>{b.customer?.name || '—'}<small>{b.customer?.email || ''}</small></td><td>{b.owner?.name || '—'}</td><td>{date(b.pickupDate)} – {date(b.returnDate)}<small>{b.totalDays} days</small></td><td>₹{money(b.totalAmount)}</td><td><Status value={b.status}/></td></tr>)}</tbody></table>{!filteredBookings.length&&<p className="admin-empty">No matching bookings found.</p>}</div>}
      </div>}
    </>}
    <div className="admin-footnote"><ShieldCheck size={15}/> Admin access only. Passwords are never included in the users list.</div>
  </section>;
}
