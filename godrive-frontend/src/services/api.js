const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('rac_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export function mapCar(car) {
  return {
    id: car._id,
    name: car.title || `${car.brand || ''} ${car.model || ''}`.trim(),
    image: car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200',
    type: car.category || 'Other',
    price: Number(car.pricePerDay || 0),
    location: car.location || '',
    seats: car.seats || 5,
    fuel: car.fuelType || 'Petrol',
    transmission: car.transmission || 'Manual',
    description: car.description || '',
    owner: car.owner?.name || 'Verified owner',
    year: car.year,
    brand: car.brand,
    model: car.model,
    status: car.status,
    raw: car
  };
}
