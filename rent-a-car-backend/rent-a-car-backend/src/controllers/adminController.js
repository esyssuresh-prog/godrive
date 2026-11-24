import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

export async function getAdminSummary(req, res, next) {
  try {
    const [totalUsers, customers, owners, totalCars, pendingCars, approvedCars, rejectedCars,
      totalBookings, pendingBookings, confirmedBookings, confirmedValue] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: 'customer' }), User.countDocuments({ role: 'owner' }),
      Car.countDocuments(), Car.countDocuments({ status: 'pending' }), Car.countDocuments({ status: 'approved' }),
      Car.countDocuments({ status: 'rejected' }), Booking.countDocuments(), Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }), Booking.aggregate([
        { $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);
    res.json({ summary: { totalUsers, customers, owners, totalCars, pendingCars, approvedCars, rejectedCars,
      totalBookings, pendingBookings, confirmedBookings, confirmedBookingValue: confirmedValue[0]?.total || 0 } });
  } catch (error) { next(error); }
}

export async function getAdminUsers(req, res, next) {
  try {
    const users = await User.find().select('name email phone role isVerified createdAt').sort({ createdAt: -1 }).limit(300);
    res.json({ count: users.length, users });
  } catch (error) { next(error); }
}

export async function getAdminCars(req, res, next) {
  try {
    const cars = await Car.find().populate('owner', 'name email phone').sort({ createdAt: -1 }).limit(300);
    res.json({ count: cars.length, cars });
  } catch (error) { next(error); }
}

export async function getAdminBookings(req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate('car', 'title brand model year images location pricePerDay')
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 }).limit(300);
    res.json({ count: bookings.length, bookings });
  } catch (error) { next(error); }
}
