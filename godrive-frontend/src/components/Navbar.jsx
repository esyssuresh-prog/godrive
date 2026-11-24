import { Link, NavLink, useNavigate } from "react-router-dom";
import { CarFront, Menu, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const signOut = () => { logout(); setOpen(false); navigate("/"); };

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" to="/"><span className="brand-icon"><CarFront size={23}/></span><span>Go<span className="brand-accent">Drive</span></span></Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation"><Menu/></button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          <NavLink to="/cars" onClick={() => setOpen(false)}>Explore cars</NavLink>
          <a href="/#how-it-works" onClick={() => setOpen(false)}>How it works</a>
          {user?.role !== "admin" && <NavLink to="/list-your-car" onClick={() => setOpen(false)}>List your car</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? <>
            <Link className="nav-user" to={user.role === "admin" ? "/admin" : user.role === "owner" ? "/owner" : "/dashboard"}><UserCircle size={18}/>{user.name}</Link>
            <button className="btn btn-outline btn-small" onClick={signOut}><LogOut size={15}/> Logout</button>
          </> : <><Link className="login-link" to="/login">Log in</Link><Link className="btn btn-primary btn-small" to="/register">Sign up</Link></>}
        </div>
      </div>
    </header>
  );
}