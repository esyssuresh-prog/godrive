import mongoose from 'mongoose';
import Car from '../models/Car.js';

// Admin: see all cars waiting for approval.
export async function listPendingCars(req, res, next) {
  try {
    const cars = await Car.find({ status: 'pending' })
      .populate('owner', 'name email phone')
      .sort({ createdAt: 1 });
    return res.json({ count: cars.length, cars });
  } catch (error) {
    next(error);
  }
}

// Admin: approve or reject a submitted car.
export async function reviewCar(req, res, next) {
  try {
    const { status, rejectionReason = '' } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid car ID' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !String(rejectionReason).trim()) {
      return res.status(400).json({ message: 'Please provide a reason for rejection' });
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          rejectionReason: status === 'rejected' ? String(rejectionReason).trim().slice(0, 500) : ''
        }
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!car) return res.status(404).json({ message: 'Car not found' });

    return res.json({
      message: status === 'approved' ? 'Car approved successfully' : 'Car rejected',
      car
    });
  } catch (error) {
    next(error);
  }
}
