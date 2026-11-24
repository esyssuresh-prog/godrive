import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  brand: { type: String, required: true, trim: true, maxlength: 50 },
  model: { type: String, required: true, trim: true, maxlength: 50 },
  year: { type: Number, required: true, min: 1990, max: 2100 },
  category: { type: String, enum: ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Other'], default: 'Other' },
  transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'], required: true },
  seats: { type: Number, required: true, min: 2, max: 15 },
  pricePerDay: { type: Number, required: true, min: 1 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true, maxlength: 2000 },
  images: [{ type: String, trim: true }],
  features: [{ type: String, trim: true }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  isAvailable: { type: Boolean, default: true, index: true },
  rejectionReason: { type: String, default: '' }
}, { timestamps: true });

carSchema.index({ status: 1, isAvailable: 1, location: 1, pricePerDay: 1 });

export default mongoose.model('Car', carSchema);
