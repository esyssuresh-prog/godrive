import { Link } from "react-router-dom";
import { CarFront, Instagram, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div><Link className="brand footer-brand" to="/"><span className="brand-icon"><CarFront size={22}/></span><span>Go<span className="brand-accent">Drive</span></span></Link><p>Better journeys begin with the right car. Find a ride that fits your plans.</p><div className="socials"><Instagram/><Facebook/><Mail/></div></div>
      <div><h4>Explore</h4><Link to="/cars">Browse cars</Link><Link to="/list-your-car">List your car</Link><a href="/#how-it-works">How it works</a></div>
      <div><h4>Support</h4><a href="mailto:support@godrive.example">Contact support</a><Link to="/dashboard">My bookings</Link><a href="/#faq">FAQs</a></div>
      <div><h4>Get in touch</h4><p>support@godrive.example</p><p>Mon–Sat, 9 AM–6 PM</p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} GoDrive. All rights reserved.</span><span>Made for better journeys.</span></div>
  </footer>;
}