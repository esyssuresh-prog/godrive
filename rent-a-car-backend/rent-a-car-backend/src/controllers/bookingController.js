import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';

// Accept YYYY-MM-DD and normalize dates to UTC midnight to avoid timezone surprises.
function parseDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

function overlapsExistingBooking(carId, pickupDate, returnDate, excludeId = null) {
  const filter = {
    car: carId,
    status: { $in: ['pending', 'confirmed'] },
    pickupDate: { $lt: returnDate },
    returnDate: { $gt: pickupDate }
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Booking.findOne(filter);
}

export async function createBooking(req, res) {
  try {
    const { carId, pickupDate: pickupInput, returnDate: returnInput, pickupLocation } = req.body;
    if (!mongoose.isValidObjectId(carId)) return res.status(400).json({ message: 'Please provide a valid carId' });
    if (!pickupLocation || typeof pickupLocation !== 'string' || !pickupLocation.trim()) {
      return res.status(400).json({ message: 'Pickup location is required' });
    }

    const pickupDate = parseDateOnly(pickupInput);
    const returnDate = parseDateOnly(returnInput);
    if (!pickupDate || !returnDate) {
      return res.status(400).json({ message: 'Dates must use YYYY-MM-DD format' });
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (pickupDate < today) return res.status(400).json({ message: 'Pickup date cannot be in the past' });
    if (returnDate <= pickupDate) return res.status(400).json({ message: 'Return date must be after pickup date' });

    const car = await Car.findOne({ _id: carId, status: 'approved', isAvailable: true });
    if (!car) return res.status(404).json({ message: 'Car is not available for booking' });
    if (String(car.owner) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot book your own car' });
    }

    const existing = await overlapsExistingBooking(car._id, pickupDate, returnDate);
    if (existing) return res.status(409).json({ message: 'This car already has a booking request or confirmed booking for those dates' });

    const totalDays = Math.round((returnDate - pickupDate) / 86400000);
    const booking = await Booking.create({
      customer: req.user._id,
      owner: car.owner,
      car: car._id,
      pickupDate,
      returnDate,
      pickupLocation: pickupLocation.trim(),
      totalDays,
      pricePerDay: car.pricePerDay,
      totalAmount: totalDays * car.pricePerDay
    });

    const result = await Booking.findById(booking._id)
      .populate('car', 'title brand model year images location pricePerDay')
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone');
    return res.status(201).json({ message: 'Booking request created successfully', booking: result });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create booking', error: error.message });
  }
}

export async function getMyBookings(req, res) {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('car', 'title brand model year images location pricePerDay')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch your bookings', error: error.message });
  }
}

export async function getOwnerBookings(req, res) {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('car', 'title brand model year images location pricePerDay')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch owner bookings', error: error.message });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be confirmed, rejected, or cancelled' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role === 'owner') {
      if (String(booking.owner) !== String(req.user._id)) return res.status(403).json({ message: 'This booking does not belong to you' });
      if (!['confirmed', 'rejected'].includes(status)) return res.status(400).json({ message: 'Owners can only confirm or reject requests' });
      if (booking.status !== 'pending') return res.status(400).json({ message: 'Only pending bookings can be reviewed' });
      if (status === 'confirmed') {
        const conflict = await overlapsExistingBooking(booking.car, booking.pickupDate, booking.returnDate, booking._id);
        if (conflict) return res.status(409).json({ message: 'Another booking overlaps these dates. This request cannot be confirmed.' });
      }
    } else if (req.user.role === 'customer') {
      if (String(booking.customer) !== String(req.user._id)) return res.status(403).json({ message: 'This booking does not belong to you' });
      if (status !== 'cancelled' || booking.status !== 'pending') {
        return res.status(400).json({ message: 'You can cancel only pending booking requests' });
      }
    } else {
      return res.status(403).json({ message: 'You do not have permission to update this booking' });
    }

    booking.status = status;
    await booking.save();
    const result = await Booking.findById(booking._id)
      .populate('car', 'title brand model year images location pricePerDay')
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone');
    res.json({ message: `Booking ${status} successfully`, booking: result });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update booking', error: error.message });
  }
}
