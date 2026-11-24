import mongoose from 'mongoose';
import Car from '../models/Car.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');

function validCarInput(body, creating = false) {
  const required = ['title', 'brand', 'model', 'year', 'transmission', 'fuelType', 'seats', 'pricePerDay', 'location'];
  if (creating) {
    const missing = required.filter(key => body[key] === undefined || body[key] === null || body[key] === '');
    if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  }
  if (body.pricePerDay !== undefined && (!Number.isFinite(Number(body.pricePerDay)) || Number(body.pricePerDay) <= 0)) return 'pricePerDay must be greater than zero';
  if (body.year !== undefined && (!Number.isInteger(Number(body.year)) || Number(body.year) < 1990 || Number(body.year) > new Date().getFullYear() + 1)) return 'Enter a valid manufacturing year';
  if (body.seats !== undefined && (!Number.isInteger(Number(body.seats)) || Number(body.seats) < 2 || Number(body.seats) > 15)) return 'Seats must be between 2 and 15';
  if (body.images !== undefined && (!Array.isArray(body.images) || body.images.length > 10 || body.images.some(x => typeof x !== 'string'))) return 'images must be an array of up to 10 image URLs';
  if (body.features !== undefined && (!Array.isArray(body.features) || body.features.some(x => typeof x !== 'string'))) return 'features must be an array of strings';
  return null;
}

const ownerCarFields = ['title', 'brand', 'model', 'year', 'category', 'transmission', 'fuelType', 'seats', 'pricePerDay', 'location', 'description', 'images', 'features', 'isAvailable'];

export async function createCar(req, res, next) {
  try {
    const error = validCarInput(req.body, true);
    if (error) return res.status(400).json({ message: error });
    const data = Object.fromEntries(ownerCarFields.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
    const car = await Car.create({ ...data, owner: req.user._id, status: 'pending' });
    return res.status(201).json({ message: 'Car submitted for admin approval', car });
  } catch (error) { next(error); }
}

export async function listCars(req, res, next) {
  try {
    const { search, location, category, transmission, fuelType, minPrice, maxPrice, seats, sort = 'newest', page = 1, limit = 12 } = req.query;
    const filter = { status: 'approved', isAvailable: true };
    if (search) {
      const term = new RegExp(escapeRegex(String(search).slice(0, 60)), 'i');
      filter.$or = [{ title: term }, { brand: term }, { model: term }, { location: term }];
    }
    if (location) filter.location = new RegExp(escapeRegex(String(location).slice(0, 60)), 'i');
    if (category) filter.category = category;
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (seats) filter.seats = Number(seats);
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerDay = {};
      if (minPrice !== undefined) filter.pricePerDay.$gte = Math.max(0, Number(minPrice) || 0);
      if (maxPrice !== undefined) filter.pricePerDay.$lte = Math.max(0, Number(maxPrice) || 0);
    }
    const sortOptions = { newest: { createdAt: -1 }, price_low: { pricePerDay: 1 }, price_high: { pricePerDay: -1 } };
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const [cars, total] = await Promise.all([
      Car.find(filter).populate('owner', 'name').sort(sortOptions[sort] || sortOptions.newest).skip((safePage - 1) * safeLimit).limit(safeLimit),
      Car.countDocuments(filter)
    ]);
    return res.json({ cars, pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit), limit: safeLimit } });
  } catch (error) { next(error); }
}

export async function getCarById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid car ID' });
    const car = await Car.findOne({ _id: req.params.id, status: 'approved' }).populate('owner', 'name');
    if (!car) return res.status(404).json({ message: 'Car not found' });
    return res.json({ car });
  } catch (error) { next(error); }
}

export async function getMyCars(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    return res.json({ cars });
  } catch (error) { next(error); }
}

export async function updateCar(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid car ID' });
    const error = validCarInput(req.body);
    if (error) return res.status(400).json({ message: error });
    const data = Object.fromEntries(ownerCarFields.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.owner = req.user._id;
    const car = await Car.findOneAndUpdate(filter, { $set: { ...data, status: 'pending' } }, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ message: 'Car not found or you do not own this car' });
    return res.json({ message: 'Car updated and submitted for approval again', car });
  } catch (error) { next(error); }
}

export async function deleteCar(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid car ID' });
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.owner = req.user._id;
    const car = await Car.findOneAndDelete(filter);
    if (!car) return res.status(404).json({ message: 'Car not found or you do not own this car' });
    return res.json({ message: 'Car deleted successfully' });
  } catch (error) { next(error); }
}
