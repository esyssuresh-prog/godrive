import { Link } from "react-router-dom";
import { MapPin, Star, Users, Settings2, Fuel } from "lucide-react";

export default function CarCard({ car }) {
  return <article className="car-card">
    <Link to={`/cars/${car.id}`} className="car-image-wrap"><img src={car.image} alt={car.name}/><span className="car-type">{car.type}</span></Link>
    <div className="car-card-body">
      <div className="car-title-row"><h3>{car.name}</h3>{car.rating ? <span className="rating"><Star size={14} fill="currentColor"/> {car.rating}</span> : null}</div>
      <p className="muted location-line"><MapPin size={14}/>{car.location}</p>
      <div className="car-specs"><span><Users size={15}/>{car.seats} seats</span><span><Settings2 size={15}/>{car.transmission}</span><span><Fuel size={15}/>{car.fuel}</span></div>
      <div className="car-card-bottom"><div><strong>₹{car.price.toLocaleString("en-IN")}</strong><small> / day</small></div><Link className="btn btn-dark btn-small" to={`/cars/${car.id}`}>View details</Link></div>
    </div>
  </article>;
}