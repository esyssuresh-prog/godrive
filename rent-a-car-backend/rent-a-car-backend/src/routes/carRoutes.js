import { Router } from 'express';
import { createCar, deleteCar, getCarById, getMyCars, listCars, updateCar } from '../controllers/carController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { listPendingCars, reviewCar } from '../controllers/adminCarController.js';

const router = Router();

// Admin review routes (must be declared before /:id)
router.get('/admin/pending', protect, allowRoles('admin'), listPendingCars);
router.patch('/:id/review', protect, allowRoles('admin'), reviewCar);

// Public browsing routes
router.get('/', listCars);
router.get('/mine', protect, allowRoles('owner', 'admin'), getMyCars);
router.get('/:id', getCarById);

// Owner management routes
router.post('/', protect, allowRoles('owner'), createCar);
router.patch('/:id', protect, allowRoles('owner', 'admin'), updateCar);
router.delete('/:id', protect, allowRoles('owner', 'admin'), deleteCar);

export default router;
