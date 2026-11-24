import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true, trim: true, maxlength: 200 },
  totalDays: { type: Number, required: true, min: 1 },
  pricePerDay: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  }
}, { timestamps: true });

bookingSchema.index({ car: 1, status: 1, pickupDate: 1, returnDate: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
