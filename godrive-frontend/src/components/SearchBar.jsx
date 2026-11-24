import { useState } from "react";
import { MapPin, CalendarDays, Clock3, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Lucknow");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropTime, setDropTime] = useState("10:00");

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ location, pickup, drop, pickupTime, dropTime });
    navigate(`/cars?${params.toString()}`);
  };

  return <form className="search-panel" onSubmit={search}>
    <label className="search-field"><span><MapPin size={17}/> Pickup location</span><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter city" required/></label>
    <label className="search-field"><span><CalendarDays size={17}/> Pickup date</span><input type="date" value={pickup} min={new Date().toISOString().slice(0,10)} onChange={e => setPickup(e.target.value)} required/></label>
    <label className="search-field"><span><Clock3 size={17}/> Pickup time</span><input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} required/></label>
    <label className="search-field"><span><CalendarDays size={17}/> Return date</span><input type="date" value={drop} min={pickup || new Date().toISOString().slice(0,10)} onChange={e => setDrop(e.target.value)} required/></label>
    <label className="search-field"><span><Clock3 size={17}/> Return time</span><input type="time" value={dropTime} onChange={e => setDropTime(e.target.value)} required/></label>
    <button className="btn btn-primary search-submit" type="submit"><Search size={18}/> Search cars</button>
  </form>;
}